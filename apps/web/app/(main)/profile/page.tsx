'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { apiRequest } from '@/lib/api-client';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import type { ResumeState } from '@/lib/types';

/** Resume pipeline states per design: UPLOADED → SCANNED → PARSED | FAILED */
const RESUME_STATE_LABELS: Record<ResumeState, string> = {
  uploaded: 'Uploaded',
  scanned: 'Scanned',
  parsed: 'Parsed',
  failed: 'Failed',
};

export default function ProfilePage() {
  const { user, accessToken } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [nameSaving, setNameSaving] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);
  const [resumeState, setResumeState] = useState<ResumeState | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const saveName = useCallback(async () => {
    setNameSaving(true);
    setNameSaved(false);
    // Backend PATCH /me for name not yet implemented; persist when available
    await new Promise((r) => setTimeout(r, 300));
    setNameSaving(false);
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2000);
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file || uploading) return;
      const allowed = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      if (!allowed.includes(file.type)) {
        setUploadError('Please upload a PDF or DOCX file.');
        return;
      }
      setUploadError(null);
      setUploading(true);
      setResumeState('uploaded');
      // MVP: simulate pipeline; replace with real API when P1 (Upload Resume API) is available
      await new Promise((r) => setTimeout(r, 600));
      setResumeState('scanned');
      await new Promise((r) => setTimeout(r, 800));
      setResumeState('parsed');
      setUploading(false);
    },
    [uploading],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile],
  );
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);
  const onDragLeave = useCallback(() => setDragOver(false), []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">Profile</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Manage your account and resume for event matching.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Your email is used to sign in. Name is visible to matches.
          </CardDescription>
        </CardHeader>
        <div className="space-y-4">
          <Input label="Email" value={user?.email ?? ''} disabled />
          <div className="flex gap-3 items-end">
            <Input
              label="Display name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={saveName}
            />
            <Button variant="secondary" onClick={saveName} loading={nameSaving} type="button">
              {nameSaved ? 'Saved' : 'Save'}
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resume</CardTitle>
          <CardDescription>
            Upload a PDF or DOCX. We scan for security, extract text, and parse skills and
            experience for matching. You can re-upload if a previous attempt failed; your last
            successful resume stays active.
          </CardDescription>
        </CardHeader>
        <div className="space-y-4">
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver ? 'border-[var(--accent)] bg-[var(--muted-bg)]' : 'border-[var(--border)]'
            }`}
          >
            <input
              type="file"
              accept=".pdf,.docx"
              className="hidden"
              id="resume-upload"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
                e.target.value = '';
              }}
              disabled={uploading}
            />
            <label htmlFor="resume-upload" className="cursor-pointer block">
              <p className="text-sm text-[var(--muted)] mb-2">
                Drag and drop your resume here, or click to browse.
              </p>
              <span className="btn btn-secondary inline-flex">
                {uploading ? 'Processing…' : 'Choose file'}
              </span>
            </label>
          </div>

          {resumeState && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-[var(--muted)]">Status:</span>
              <Badge status={resumeState}>{RESUME_STATE_LABELS[resumeState]}</Badge>
              {resumeState === 'parsed' && (
                <span className="text-sm text-[var(--success)]">Ready for matching.</span>
              )}
              {resumeState === 'failed' && (
                <span className="text-sm text-[var(--destructive)]">
                  You can re-upload. Your last successful resume remains active.
                </span>
              )}
            </div>
          )}

          {uploadError && (
            <p className="text-sm text-[var(--destructive)]" role="alert">
              {uploadError}
            </p>
          )}

          <p className="text-xs text-[var(--muted)]">
            Pipeline: Upload → Malware scan → Text extraction → Field extraction &amp;
            normalization. Low-confidence fields will be flagged for your review on this page when
            available.
          </p>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile fields (from resume)</CardTitle>
          <CardDescription>
            Skills, titles, and industries we extract. Review and correct any low-confidence items
            here.
          </CardDescription>
        </CardHeader>
        <p className="text-sm text-[var(--muted)]">
          Extracted fields will appear here after a successful parse. This section scales to show
          confidence scores and per-field review in a future iteration.
        </p>
      </Card>
    </div>
  );
}
