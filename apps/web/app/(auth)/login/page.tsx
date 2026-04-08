'use client';

import { SignIn } from '@clerk/nextjs';

export default function LoginPage() {
  return (
    <div className="flex justify-center">
      <SignIn path="/login" routing="path" signUpUrl="/register" fallbackRedirectUrl="/events" />
    </div>
  );
}
