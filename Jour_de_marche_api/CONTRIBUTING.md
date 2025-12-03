# Contributing Guidelines

## 🚀 Guide de Contribution

### Processus de Contribution

1. **Fork** le projet
2. Créer une branche feature (`git checkout -b feature/amazing-feature`)
3. Committer vos changements (`git commit -m 'Add amazing feature'`)
4. Pousser vers la branche (`git push origin feature/amazing-feature`)
5. Créer une Pull Request

### Standards de Code

#### Naming Conventions
- Fichiers: `kebab-case` (ex: `user.controller.js`)
- Variables/Fonctions: `camelCase`
- Classes: `PascalCase`
- Constantes: `UPPER_CASE`

#### Linter
```bash
npm run lint
npm run lint:fix
```

#### Formatter
```bash
npm run format
```

### Structure des commits

```
type(scope): description

[optional body]
[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Exemple:
```
feat(auth): add password reset functionality

Added endpoint to reset forgotten passwords
```

### Avant de faire un PR

- [ ] Code formaté (`npm run format`)
- [ ] Linter passé (`npm run lint`)
- [ ] Tests passés (`npm run test`)
- [ ] Documentation à jour
- [ ] Pas de secrets committés

### Git Workflow

```bash
# Development
git checkout develop

# Create feature branch
git checkout -b feature/feature-name

# Work and commit
git add .
git commit -m "feat(module): description"

# Push
git push origin feature/feature-name

# Create PR to develop, after review merge to main
```

### Tests

Tout code doit avoir des tests:

```javascript
describe('Feature', () => {
  it('should do something', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = myFunction(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

### Documentation

- Ajouter JSDoc pour les fonctions publiques
- Mettre à jour README.md
- Documenter les endpoints API
- Ajouter des commentaires pour la logique complexe

### Code Review

Les reviewers vérifieront:
- ✅ Qualité du code
- ✅ Couverture de tests
- ✅ Documentation
- ✅ Performance
- ✅ Sécurité

---

Merci de contribuer! 🙌
