#!/usr/bin/env python3
"""
Migrate existing users from public.users to auth.users

This script copies user identity data (email, password_hash, role, status, etc.)
from the existing users table in the public schema to the new auth.users table
in the auth schema.

IMPORTANT:
- Run this AFTER creating the auth schema with auth-service migrations
- This preserves UUIDs so all existing references remain valid
- Profile data (name, avatar_url) stays in public.users for the core service

Usage:
    cd /path/to/Meetra
    python scripts/migrate_users_to_auth.py

    # Dry run (no changes):
    python scripts/migrate_users_to_auth.py --dry-run

    # Force overwrite existing auth users:
    python scripts/migrate_users_to_auth.py --force
"""

import argparse
import os
import sys
from datetime import datetime, timezone

# Add apps/api to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "apps", "api"))

from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", "apps", "api", ".env"))


def get_database_url():
    return os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg://meetra:meetra@localhost:5432/meetra",
    )


def migrate_users(dry_run: bool = False, force: bool = False):
    """Migrate users from public schema to auth schema."""
    engine = create_engine(get_database_url())
    
    with engine.connect() as conn:
        # Check if auth schema exists
        result = conn.execute(text(
            "SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'auth'"
        ))
        if not result.fetchone():
            print("ERROR: auth schema does not exist.")
            print("Run auth-service migrations first: pnpm auth:db:upgrade")
            return False

        # Check if auth.users table exists
        result = conn.execute(text("""
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'auth' AND table_name = 'users'
        """))
        if not result.fetchone():
            print("ERROR: auth.users table does not exist.")
            print("Run auth-service migrations first: pnpm auth:db:upgrade")
            return False

        # Get users from public schema
        result = conn.execute(text("""
            SELECT 
                id, email, password_hash, role, status, 
                last_login_at, created_at, updated_at
            FROM public.users
            WHERE email IS NOT NULL AND password_hash IS NOT NULL
            ORDER BY created_at ASC
        """))
        users = result.fetchall()
        
        print(f"Found {len(users)} users with password_hash in public.users")
        
        if not users:
            print("No users to migrate.")
            return True

        migrated = 0
        skipped = 0
        errors = 0

        for user in users:
            user_id, email, password_hash, role, status, last_login_at, created_at, updated_at = user
            
            # Check if user already exists in auth schema
            existing = conn.execute(text(
                "SELECT id FROM auth.users WHERE id = :id"
            ), {"id": user_id}).fetchone()
            
            if existing:
                if force:
                    if not dry_run:
                        conn.execute(text("""
                            UPDATE auth.users SET
                                email = :email,
                                password_hash = :password_hash,
                                role = :role,
                                status = :status,
                                last_login_at = :last_login_at,
                                updated_at = :updated_at
                            WHERE id = :id
                        """), {
                            "id": user_id,
                            "email": email,
                            "password_hash": password_hash,
                            "role": role,
                            "status": status,
                            "last_login_at": last_login_at,
                            "updated_at": datetime.now(timezone.utc),
                        })
                    print(f"  Updated: {email} ({user_id})")
                    migrated += 1
                else:
                    print(f"  Skipped (exists): {email} ({user_id})")
                    skipped += 1
                continue

            # Insert into auth schema
            if not dry_run:
                try:
                    conn.execute(text("""
                        INSERT INTO auth.users (
                            id, email, password_hash, role, status,
                            last_login_at, created_at, updated_at
                        ) VALUES (
                            :id, :email, :password_hash, :role, :status,
                            :last_login_at, :created_at, :updated_at
                        )
                    """), {
                        "id": user_id,
                        "email": email,
                        "password_hash": password_hash,
                        "role": role,
                        "status": status,
                        "last_login_at": last_login_at,
                        "created_at": created_at,
                        "updated_at": updated_at,
                    })
                    print(f"  Migrated: {email} ({user_id})")
                    migrated += 1
                except Exception as e:
                    print(f"  ERROR migrating {email}: {e}")
                    errors += 1
            else:
                print(f"  Would migrate: {email} ({user_id})")
                migrated += 1

        # Migrate refresh tokens
        print("\nMigrating refresh tokens...")
        result = conn.execute(text("""
            SELECT COUNT(*) FROM public.refresh_tokens rt
            WHERE EXISTS (SELECT 1 FROM auth.users u WHERE u.id = rt.user_id)
        """))
        token_count = result.scalar()
        print(f"Found {token_count} refresh tokens to migrate")

        if token_count > 0 and not dry_run:
            # Copy tokens for users that exist in auth schema
            conn.execute(text("""
                INSERT INTO auth.refresh_tokens (
                    id, user_id, token_hash, issued_at, expires_at,
                    revoked_at, replaced_by, family_id
                )
                SELECT 
                    rt.id, rt.user_id, rt.token_hash, rt.issued_at, rt.expires_at,
                    rt.revoked_at, rt.replaced_by, rt.family_id
                FROM public.refresh_tokens rt
                WHERE EXISTS (SELECT 1 FROM auth.users u WHERE u.id = rt.user_id)
                ON CONFLICT (id) DO NOTHING
            """))
            print(f"  Migrated refresh tokens")

        if not dry_run:
            conn.commit()

        print(f"\n{'DRY RUN - ' if dry_run else ''}Summary:")
        print(f"  Migrated: {migrated}")
        print(f"  Skipped:  {skipped}")
        print(f"  Errors:   {errors}")

        return errors == 0


def main():
    parser = argparse.ArgumentParser(
        description="Migrate users from public schema to auth schema"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be done without making changes",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite existing users in auth schema",
    )
    args = parser.parse_args()

    print("=" * 60)
    print("User Migration: public.users -> auth.users")
    print("=" * 60)
    
    if args.dry_run:
        print("DRY RUN MODE - No changes will be made\n")

    success = migrate_users(dry_run=args.dry_run, force=args.force)
    
    if success:
        print("\nMigration completed successfully!")
        if not args.dry_run:
            print("\nNext steps:")
            print("1. Verify users in auth schema: ")
            print("   docker exec meetra-postgres psql -U meetra -d meetra -c 'SELECT * FROM auth.users;'")
            print("2. Start auth-service: pnpm dev:auth")
            print("3. Test login flow through gateway")
    else:
        print("\nMigration completed with errors.")
        sys.exit(1)


if __name__ == "__main__":
    main()
