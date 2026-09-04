'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Check,
  FileSpreadsheet,
  LoaderCircle,
  RefreshCw,
  Search,
} from 'lucide-react';

import type {
  ApplicationRecord,
  ApplicationStatus,
} from '@/lib/applications-db';

const statusLabels: Record<ApplicationStatus, string> = {
  new: 'Yeni',
  reviewing: 'İnceleniyor',
  interview: 'Görüşme',
  accepted: 'Kabul',
  rejected: 'Olumsuz',
};

const teamLabels: Record<string, string> = {
  'vehicle-dynamics': 'Araç Dinamiği',
  'chassis-structures': 'Şasi ve Yapısal Sistemler',
  powertrain: 'Güç Aktarma Sistemleri',
  aerodynamics: 'Aerodinamik',
  'composites-manufacturing': 'Kompozitler ve Üretim',
  'electrical-electronics': 'Elektrik ve Elektronik',
  'sponsorship-partnerships': 'Sponsorluk ve İş Birlikleri',
  'media-communications': 'Medya ve İletişim',
  'finance-operations': 'Finans ve Operasyon',
};

const universityLabels: Record<string, string> = {
  sau: 'Sakarya Üniversitesi',
  subu: 'Sakarya Uygulamalı Bilimler Üniversitesi',
};

const availabilityLabels: Record<string, string> = {
  yes: 'Evet',
  no: 'Hayır',
  depends: 'Koşullara göre',
};

const inputClass =
  'h-11 w-full border border-border bg-[#061812] px-3 text-sm text-white outline-none focus:border-racing-green';

function dateTime(value: number | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Istanbul',
  }).format(new Date(value));
}

function departmentName(application: ApplicationRecord) {
  const department = application.assignedDepartment || application.primaryTeam;
  return teamLabels[department] ?? department;
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="border-t border-border py-4 first:border-t-0">
      <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-racing-green">
        {label}
      </dt>
      <dd className="mt-2 whitespace-pre-wrap text-sm leading-7 text-white/80">
        {value || '—'}
      </dd>
    </div>
  );
}

function ReviewPanel({
  application,
  viewer,
  onSaved,
  onError,
}: {
  application: ApplicationRecord;
  viewer: string;
  onSaved: (updated: ApplicationRecord) => void;
  onError: (message: string) => void;
}) {
  const [reviewStatus, setReviewStatus] = useState<ApplicationStatus>(
    application.status,
  );
  const [assignedDepartment, setAssignedDepartment] = useState(
    application.assignedDepartment,
  );
  const [reviewerNote, setReviewerNote] = useState(application.reviewerNote);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function saveReview() {
    setSaving(true);
    setSaved(false);
    onError('');
    try {
      const response = await fetch('/api/admin/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: application.id,
          status: reviewStatus,
          assignedDepartment,
          reviewerNote,
        }),
      });
      if (!response.ok) throw new Error('save-failed');
      onSaved({
        ...application,
        status: reviewStatus,
        assignedDepartment,
        reviewerNote,
        reviewedBy: viewer,
        reviewedAt: Date.now(),
      });
      setSaved(true);
    } catch {
      onError('Değişiklikler kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <aside className="h-fit border border-border bg-[#071b14] p-5 xl:sticky xl:top-6">
      <h3 className="font-heading text-xl font-bold uppercase">
        Değerlendirme
      </h3>
      <label className="mt-5 block text-xs font-bold uppercase tracking-wider text-white/55">
        Durum
        <select
          value={reviewStatus}
          onChange={(event) =>
            setReviewStatus(event.target.value as ApplicationStatus)
          }
          className={`${inputClass} mt-2`}
        >
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="mt-5 block text-xs font-bold uppercase tracking-wider text-white/55">
        Yönlendirilen departman
        <select
          value={assignedDepartment}
          onChange={(event) => setAssignedDepartment(event.target.value)}
          className={`${inputClass} mt-2`}
        >
          <option value="">Henüz atanmadı</option>
          {Object.entries(teamLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="mt-5 block text-xs font-bold uppercase tracking-wider text-white/55">
        Ekip içi not
        <textarea
          value={reviewerNote}
          onChange={(event) => setReviewerNote(event.target.value)}
          maxLength={4000}
          rows={7}
          className="mt-2 w-full resize-y border border-border bg-[#061812] p-3 text-sm leading-6 text-white outline-none focus:border-racing-green"
          placeholder="Görüşme notu, güçlü yönler, takip edilecek konular…"
        />
      </label>
      <button
        type="button"
        onClick={() => void saveReview()}
        disabled={saving}
        className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 bg-racing-green px-5 text-sm font-black uppercase tracking-wider text-ink disabled:opacity-50"
      >
        {saving ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : saved ? (
          <Check className="size-4" />
        ) : null}
        {saving
          ? 'Kaydediliyor'
          : saved
            ? 'Kaydedildi'
            : 'Değerlendirmeyi kaydet'}
      </button>
      <div className="mt-5 border-t border-border pt-4 text-xs leading-6 text-white/45">
        <p>
          E-posta:{' '}
          {application.emailDeliveryStatus === 'sent'
            ? 'Gönderildi'
            : application.emailDeliveryStatus === 'failed'
              ? 'Gönderilemedi'
              : 'Bekliyor'}
        </p>
        <p>Son işlem: {dateTime(application.reviewedAt)}</p>
        {application.reviewedBy ? (
          <p>İşlemi yapan: {application.reviewedBy}</p>
        ) : null}
      </div>
    </aside>
  );
}

export function ApplicationAdmin() {
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [viewer, setViewer] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const selected = useMemo(
    () =>
      applications.find((application) => application.id === selectedId) ?? null,
    [applications, selectedId],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (teamFilter) params.set('team', teamFilter);
    if (query) params.set('search', query);

    try {
      const response = await fetch(
        `/api/admin/applications?${params.toString()}`,
        {
          cache: 'no-store',
        },
      );
      if (response.status === 401) {
        setError(
          'Yönetim erişimi henüz etkinleştirilmemiş veya oturumunuz doğrulanamadı.',
        );
        setApplications([]);
        return;
      }
      if (!response.ok) throw new Error('load-failed');
      const data = (await response.json()) as {
        applications?: ApplicationRecord[];
        viewer?: string;
      };
      const nextApplications = data.applications ?? [];
      setApplications(nextApplications);
      setViewer(data.viewer ?? '');
      setSelectedId((current) =>
        nextApplications.some((application) => application.id === current)
          ? current
          : (nextApplications[0]?.id ?? ''),
      );
    } catch {
      setError('Başvurular yüklenemedi. Biraz sonra yeniden deneyin.');
    } finally {
      setLoading(false);
    }
  }, [query, statusFilter, teamFilter]);

  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1600px]">
        <header className="flex flex-col gap-4 border-b border-border pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-racing-green">
              SAUFormula Yönetim
            </p>
            <h1 className="mt-2 font-heading text-4xl font-black uppercase sm:text-5xl">
              Takım başvuruları
            </h1>
            <p className="mt-2 text-sm text-white/50">
              {viewer ? `Oturum: ${viewer}` : 'Korumalı yönetim alanı'}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            {/* oxlint-disable-next-line next(no-html-link-for-pages) -- A native link preserves the file download response. */}
            <a
              href="/api/admin/applications/export"
              download
              className="inline-flex h-11 items-center justify-center gap-2 bg-racing-green px-4 text-sm font-black uppercase tracking-wider text-ink hover:bg-racing-green/85"
            >
              <FileSpreadsheet className="size-4" /> Kabul edilenleri Excel’e
              aktar
            </a>
            <button
              type="button"
              onClick={() => void load()}
              disabled={loading}
              className="inline-flex h-11 items-center justify-center gap-2 border border-border px-4 text-sm font-bold uppercase tracking-wider hover:border-racing-green disabled:opacity-50"
            >
              <RefreshCw
                className={`size-4 ${loading ? 'animate-spin' : ''}`}
              />{' '}
              Yenile
            </button>
          </div>
        </header>

        <form
          className="grid gap-3 border-b border-border py-5 md:grid-cols-[minmax(220px,1fr)_220px_260px_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            setQuery(search.trim());
          }}
        >
          <label className="relative">
            <span className="sr-only">Ara</span>
            <Search className="absolute left-3 top-3.5 size-4 text-white/40" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Ad, e-posta veya bölüm ara"
              className={`${inputClass} pl-10`}
            />
          </label>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className={inputClass}
          >
            <option value="">Tüm durumlar</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            value={teamFilter}
            onChange={(event) => setTeamFilter(event.target.value)}
            className={inputClass}
          >
            <option value="">Tüm departmanlar</option>
            {Object.entries(teamLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="h-11 bg-racing-green px-6 text-sm font-black uppercase tracking-wider text-ink"
          >
            Ara
          </button>
        </form>

        {error ? (
          <div className="my-5 border border-red-500/40 bg-red-950/30 p-4 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <div className="grid min-h-[650px] border-x border-b border-border lg:grid-cols-[390px_1fr]">
          <aside className="border-b border-border lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between border-b border-border px-5 py-4 text-sm text-white/55">
              <span>{applications.length} başvuru</span>
              {loading ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : null}
            </div>
            <div className="max-h-[720px] overflow-y-auto">
              {!loading && !applications.length ? (
                <p className="p-6 text-sm leading-7 text-white/50">
                  Bu filtrelerle eşleşen başvuru yok.
                </p>
              ) : null}
              {applications.map((application) => (
                <button
                  key={application.id}
                  type="button"
                  onClick={() => setSelectedId(application.id)}
                  className={`block w-full border-b border-border p-5 text-left transition-colors hover:bg-white/[0.04] ${selectedId === application.id ? 'bg-racing-green/[0.08]' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <strong className="text-base">{application.name}</strong>
                    <span className="shrink-0 border border-border px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-racing-green">
                      {statusLabels[application.status]}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-white/60">
                    {departmentName(application)}
                  </p>
                  <div className="mt-3 flex justify-between text-xs text-white/40">
                    <span>{application.academicDepartment}</span>
                    <span>{dateTime(application.submittedAt)}</span>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <section className="min-w-0 p-5 sm:p-8">
            {!selected ? (
              <p className="text-sm text-white/50">
                İncelemek için bir başvuru seçin.
              </p>
            ) : (
              <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_350px]">
                <div className="min-w-0">
                  <div className="border-b border-border pb-6">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-racing-green">
                      {departmentName(selected)}
                    </p>
                    <h2 className="mt-2 font-heading text-3xl font-black uppercase sm:text-4xl">
                      {selected.name}
                    </h2>
                    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/60">
                      <a
                        className="hover:text-racing-green"
                        href={`mailto:${selected.email}`}
                      >
                        {selected.email}
                      </a>
                      <a
                        className="hover:text-racing-green"
                        href={`tel:${selected.phone}`}
                      >
                        {selected.phone}
                      </a>
                      <span>{dateTime(selected.submittedAt)}</span>
                    </div>
                  </div>

                  <dl className="mt-4 grid gap-x-8 md:grid-cols-2">
                    <Detail
                      label="Üniversite"
                      value={
                        universityLabels[selected.university] ??
                        selected.university
                      }
                    />
                    <Detail
                      label="Bölüm / Sınıf"
                      value={`${selected.academicDepartment} · ${selected.classLevel === 'preparation' ? 'Hazırlık' : selected.classLevel}`}
                    />
                    <Detail
                      label="İkinci tercih"
                      value={
                        teamLabels[selected.secondaryTeam] ??
                        selected.secondaryTeam
                      }
                    />
                    <Detail
                      label="Haftalık süre"
                      value={`${selected.weeklyHours} saat`}
                    />
                    <Detail
                      label="Yaz atölyelerine katılım"
                      value={
                        availabilityLabels[selected.summerParticipation] ??
                        selected.summerParticipation
                      }
                    />
                    <Detail
                      label="Yoğun dönemlerde aktif rol"
                      value={
                        availabilityLabels[selected.busyPeriods] ??
                        selected.busyPeriods
                      }
                    />
                    <Detail label="LinkedIn" value={selected.linkedin} />
                    <Detail
                      label="Portföy / GitHub"
                      value={selected.portfolio}
                    />
                  </dl>

                  <dl className="mt-6">
                    <Detail
                      label="Bildiği programlar ve araçlar"
                      value={selected.programs}
                    />
                    <Detail
                      label="Topluluk deneyimi"
                      value={
                        selected.communityExperience === 'yes'
                          ? selected.communityDetails
                          : 'Daha önce toplulukta yer almamış.'
                      }
                    />
                    <Detail label="Projeleri" value={selected.projects} />
                    <Detail
                      label="Takıma katılma nedeni"
                      value={selected.motivation}
                    />
                    <Detail
                      label="Sorumluluğu yetiştiremezse izleyeceği yol"
                      value={selected.responsibilityScenario}
                    />
                    <Detail
                      label="Takımda en çok motive eden unsur"
                      value={selected.motivationFactor}
                    />
                    <Detail
                      label="Ek notlar"
                      value={selected.additionalNotes}
                    />
                  </dl>
                </div>

                <ReviewPanel
                  key={selected.id}
                  application={selected}
                  viewer={viewer}
                  onError={setError}
                  onSaved={(updated) =>
                    setApplications((current) =>
                      current.map((application) =>
                        application.id === updated.id ? updated : application,
                      ),
                    )
                  }
                />
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
