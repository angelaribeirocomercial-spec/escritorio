insert into storage.buckets (id, name, public)
values ('tenant-documents', 'tenant-documents', false)
on conflict (id) do nothing;

alter table public.documents
  add column if not exists storage_bucket text not null default 'tenant-documents',
  add column if not exists storage_path text not null default '',
  add column if not exists storage_mime_type text not null default 'application/octet-stream',
  add column if not exists storage_size_bytes bigint not null default 0;

create index if not exists documents_tenant_storage_idx
  on public.documents (tenant_id, storage_bucket, storage_path);

drop policy if exists "tenant members can read document files" on storage.objects;
create policy "tenant members can read document files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'tenant-documents'
  and exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id::text = split_part(storage.objects.name, '/', 1)
      and memberships.is_active = true
  )
);

drop policy if exists "tenant owners and admins can manage document files" on storage.objects;
create policy "tenant owners and admins can manage document files"
on storage.objects
for all
to authenticated
using (
  bucket_id = 'tenant-documents'
  and exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id::text = split_part(storage.objects.name, '/', 1)
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
)
with check (
  bucket_id = 'tenant-documents'
  and exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id::text = split_part(storage.objects.name, '/', 1)
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
);
