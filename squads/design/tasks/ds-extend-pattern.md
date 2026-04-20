---
task: ds-extend-pattern
responsavel: @brad-frost
responsavel_type: agent
atomic_layer: task
Entrada: |
  - Consulte os parametros, entradas e pre-requisitos descritos nesta task.
Saida: |
  - Produza os artefatos, validacoes e resultados esperados descritos nesta task.
Checklist:
  - [ ] Revisar objetivo e pre-requisitos da task
  - [ ] Executar o fluxo principal conforme a documentacao
  - [ ] Registrar os artefatos e validacoes esperadas
---
# Extend Existing Pattern

> Task ID: atlas-extend-pattern
> Agent: Atlas (Design System Builder)
> Version: 1.0.0

## Description

Add new variant, size, or feature to existing component without breaking compatibility. Maintains consistency with design system patterns.

## Prerequisites

- Component exists
- Design system setup complete
- Tokens available for new variant

## Workflow

### Steps

1. **Load Existing Component** - Read component file and structure
2. **Validate Extension Request** - Check compatibility with existing API
3. **Add New Variant/Size** - Extend props and implementation
4. **Update Styles** - Add new variant styles using tokens
5. **Update Tests** - Add tests for new variant
6. **Update Stories** - Add story for new variant
7. **Update Documentation** - Document new variant
8. **Validate Backward Compatibility** - Ensure existing usage still works

## Output

- Updated component file
- Updated styles
- Updated tests
- Updated documentation

## Success Criteria

- [ ] New variant implemented correctly
- [ ] Backward compatible (existing code works)
- [ ] Tests updated and passing
- [ ] Documentation reflects changes
- [ ] No breaking changes

## Example

```bash
*extend button --variant warning

Atlas: "Adding 'warning' variant to Button..."
âœ“ Updated Button.tsx (new variant prop)
âœ“ Updated Button.module.css (warning styles)
âœ“ Updated Button.test.tsx (warning tests)
âœ“ Updated Button.stories.tsx (warning story)
âœ“ Backward compatibility: âœ“

Warning variant uses:
  - color: var(--color-warning)
  - color (hover): var(--color-warning-dark)
```

## Notes

- Maintain prop interface compatibility
- Add, don't replace
- Test existing variants still work
- Document migration if API changes

