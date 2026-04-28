# Supabase Bootstrap Runbook

## Objetivo

Gerar um unico SQL consolidado do projeto e aplicar no SQL Editor da Supabase.

## Passo 1

No terminal, na raiz do projeto, rode:

```bash
npm run supabase:bootstrap:sql
```

## Passo 2

O comando gera o arquivo:

```text
supabase/out/001_full_bootstrap.sql
```

## Passo 3

Abra esse arquivo, copie todo o conteudo e cole no `SQL Editor` do projeto Supabase.

## Passo 4

Execute o SQL completo uma vez.

## Passo 5

Depois volte ao terminal e rode o smoke test:

```bash
npm run documents:upload -- --file docs/stories/13.1.document-upload-cli-storage.md --tenant-id 11111111-1111-1111-1111-111111111111 --client-id cl-001 --case-id case-101 --document-type Peticao --category Smoke --tags smoke,cli --summary "Smoke test de upload documental via CLI"
```

## Resultado esperado

- tabelas de negocio criadas
- policies aplicadas
- seeds carregadas
- bucket documental pronto
- upload CLI funcionando
