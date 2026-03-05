# Private package hosting for free (GitHub Packages)

## 1. Set package scope

Update `package.json`:

- `name`: `@teknopoint-mobile-team/accessibility-sdk`
- `publishConfig.registry`: `https://npm.pkg.github.com`

## 2. Create a GitHub token

Create a classic PAT or fine-grained token with:

- `write:packages`
- `read:packages`
- `repo` (if repository is private)

Store it as GitHub secret:

- `GH_PACKAGES_TOKEN`

## 3. Configure npm auth

Use `.npmrc` (sample in `.npmrc.example`):

```ini
@teknopoint-mobile-team:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

## 4. Local publish

```bash
cd packages/accessibility-sdk
npm run validate
npm publish
```

## 5. Consume from private registry

In the consumer app `.npmrc`:

```ini
@teknopoint-mobile-team:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Then install:

```bash
npm install @teknopoint-mobile-team/accessibility-sdk
```

## 6. Free tier notes

- GitHub Packages is commonly used as a free private registry for internal packages, subject to current GitHub account limits and policy.
- If you need fully self-hosted free registry, use Verdaccio.
