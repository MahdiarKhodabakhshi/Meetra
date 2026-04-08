'use client';

import { SignUp } from '@clerk/nextjs';

export default function RegisterPage() {
  return (
    <div className="flex justify-center">
      <SignUp path="/register" routing="path" signInUrl="/login" fallbackRedirectUrl="/events" />
    </div>
  );
}
