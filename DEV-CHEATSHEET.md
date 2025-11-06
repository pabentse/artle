Local deploy cheatsheet

- Deploy
```bash
npm run deploy
```

- Clean stuck build (ENOTEMPTY)
```bash
rm -rf build || true
chflags -R nouchg build 2>/dev/null || true
chmod -R u+w build 2>/dev/null || true
find build -mindepth 1 -delete 2>/dev/null || true
rmdir build 2>/dev/null || true
```

- Build even if ESLint blocks
```bash
DISABLE_ESLINT_PLUGIN=true npm run deploy
```

- Install deps (handle peer conflicts)
```bash
npm ci || npm install --legacy-peer-deps
```

- Optional maintenance
```bash
npx update-browserslist-db@latest
```



