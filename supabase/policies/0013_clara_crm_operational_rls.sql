alter table public.minutas enable row level security;
alter table public.versoes_peca enable row level security;
alter table public.modelos_internos enable row level security;
alter table public.teses_argumentos enable row level security;
alter table public.fontes_externas_consultadas enable row level security;
alter table public.resultados_api enable row level security;
alter table public.logs_execucao_clara enable row level security;
alter table public.observacoes_revisor_humano enable row level security;
alter table public.crm_pipeline_stages enable row level security;
alter table public.crm_leads enable row level security;
alter table public.crm_followups enable row level security;
alter table public.crm_conversas enable row level security;
alter table public.crm_contratos enable row level security;

drop policy if exists "tenant members can read minutas" on public.minutas;
create policy "tenant members can read minutas"
on public.minutas
for select
to authenticated
using (public.is_tenant_member(tenant_id));

drop policy if exists "tenant owners and admins can manage minutas" on public.minutas;
create policy "tenant owners and admins can manage minutas"
on public.minutas
for all
to authenticated
using (
  exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = minutas.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
)
with check (
  exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = minutas.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
);

drop policy if exists "tenant members can read versoes_peca" on public.versoes_peca;
create policy "tenant members can read versoes_peca"
on public.versoes_peca
for select
to authenticated
using (public.is_tenant_member(tenant_id));

drop policy if exists "tenant owners and admins can manage versoes_peca" on public.versoes_peca;
create policy "tenant owners and admins can manage versoes_peca"
on public.versoes_peca
for all
to authenticated
using (
  exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = versoes_peca.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
)
with check (
  exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = versoes_peca.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
);

drop policy if exists "tenant members can read modelos_internos" on public.modelos_internos;
create policy "tenant members can read modelos_internos"
on public.modelos_internos
for select
to authenticated
using (public.is_tenant_member(tenant_id));

drop policy if exists "tenant owners and admins can manage modelos_internos" on public.modelos_internos;
create policy "tenant owners and admins can manage modelos_internos"
on public.modelos_internos
for all
to authenticated
using (
  exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = modelos_internos.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
)
with check (
  exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = modelos_internos.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
);

drop policy if exists "tenant members can read teses_argumentos" on public.teses_argumentos;
create policy "tenant members can read teses_argumentos"
on public.teses_argumentos
for select
to authenticated
using (public.is_tenant_member(tenant_id));

drop policy if exists "tenant owners and admins can manage teses_argumentos" on public.teses_argumentos;
create policy "tenant owners and admins can manage teses_argumentos"
on public.teses_argumentos
for all
to authenticated
using (
  exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = teses_argumentos.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
)
with check (
  exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = teses_argumentos.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
);

drop policy if exists "tenant members can read fontes_externas_consultadas" on public.fontes_externas_consultadas;
create policy "tenant members can read fontes_externas_consultadas"
on public.fontes_externas_consultadas
for select
to authenticated
using (public.is_tenant_member(tenant_id));

drop policy if exists "tenant owners and admins can manage fontes_externas_consultadas" on public.fontes_externas_consultadas;
create policy "tenant owners and admins can manage fontes_externas_consultadas"
on public.fontes_externas_consultadas
for all
to authenticated
using (
  exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = fontes_externas_consultadas.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
)
with check (
  exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = fontes_externas_consultadas.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
);

drop policy if exists "tenant members can read resultados_api" on public.resultados_api;
create policy "tenant members can read resultados_api"
on public.resultados_api
for select
to authenticated
using (public.is_tenant_member(tenant_id));

drop policy if exists "tenant owners and admins can manage resultados_api" on public.resultados_api;
create policy "tenant owners and admins can manage resultados_api"
on public.resultados_api
for all
to authenticated
using (
  exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = resultados_api.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
)
with check (
  exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = resultados_api.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
);

drop policy if exists "tenant members can read logs_execucao_clara" on public.logs_execucao_clara;
create policy "tenant members can read logs_execucao_clara"
on public.logs_execucao_clara
for select
to authenticated
using (public.is_tenant_member(tenant_id));

drop policy if exists "tenant owners and admins can manage logs_execucao_clara" on public.logs_execucao_clara;
create policy "tenant owners and admins can manage logs_execucao_clara"
on public.logs_execucao_clara
for all
to authenticated
using (
  exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = logs_execucao_clara.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
)
with check (
  exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = logs_execucao_clara.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
);

drop policy if exists "tenant members can read observacoes_revisor_humano" on public.observacoes_revisor_humano;
create policy "tenant members can read observacoes_revisor_humano"
on public.observacoes_revisor_humano
for select
to authenticated
using (public.is_tenant_member(tenant_id));

drop policy if exists "tenant owners and admins can manage observacoes_revisor_humano" on public.observacoes_revisor_humano;
create policy "tenant owners and admins can manage observacoes_revisor_humano"
on public.observacoes_revisor_humano
for all
to authenticated
using (
  exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = observacoes_revisor_humano.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
)
with check (
  exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = observacoes_revisor_humano.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
);

drop policy if exists "tenant members can read crm_pipeline_stages" on public.crm_pipeline_stages;
create policy "tenant members can read crm_pipeline_stages"
on public.crm_pipeline_stages
for select
to authenticated
using (public.is_tenant_member(tenant_id));

drop policy if exists "tenant owners and admins can manage crm_pipeline_stages" on public.crm_pipeline_stages;
create policy "tenant owners and admins can manage crm_pipeline_stages"
on public.crm_pipeline_stages
for all
to authenticated
using (
  exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = crm_pipeline_stages.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
)
with check (
  exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = crm_pipeline_stages.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
);

drop policy if exists "tenant members can read crm_leads" on public.crm_leads;
create policy "tenant members can read crm_leads"
on public.crm_leads
for select
to authenticated
using (public.is_tenant_member(tenant_id));

drop policy if exists "tenant owners and admins can manage crm_leads" on public.crm_leads;
create policy "tenant owners and admins can manage crm_leads"
on public.crm_leads
for all
to authenticated
using (
  exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = crm_leads.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
)
with check (
  exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = crm_leads.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
);

drop policy if exists "tenant members can read crm_followups" on public.crm_followups;
create policy "tenant members can read crm_followups"
on public.crm_followups
for select
to authenticated
using (public.is_tenant_member(tenant_id));

drop policy if exists "tenant owners and admins can manage crm_followups" on public.crm_followups;
create policy "tenant owners and admins can manage crm_followups"
on public.crm_followups
for all
to authenticated
using (
  exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = crm_followups.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
)
with check (
  exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = crm_followups.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
);

drop policy if exists "tenant members can read crm_conversas" on public.crm_conversas;
create policy "tenant members can read crm_conversas"
on public.crm_conversas
for select
to authenticated
using (public.is_tenant_member(tenant_id));

drop policy if exists "tenant owners and admins can manage crm_conversas" on public.crm_conversas;
create policy "tenant owners and admins can manage crm_conversas"
on public.crm_conversas
for all
to authenticated
using (
  exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = crm_conversas.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
)
with check (
  exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = crm_conversas.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
);

drop policy if exists "tenant members can read crm_contratos" on public.crm_contratos;
create policy "tenant members can read crm_contratos"
on public.crm_contratos
for select
to authenticated
using (public.is_tenant_member(tenant_id));

drop policy if exists "tenant owners and admins can manage crm_contratos" on public.crm_contratos;
create policy "tenant owners and admins can manage crm_contratos"
on public.crm_contratos
for all
to authenticated
using (
  exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = crm_contratos.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
)
with check (
  exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = crm_contratos.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
);
