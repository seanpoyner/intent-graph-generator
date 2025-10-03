# npm Publish Checklist

## Pre-Publish Verification ✅

- [x] Package built successfully
- [x] All tests passing (42/42)
- [x] MIT License added
- [x] README.md updated with npm installation
- [x] package.json configured with:
  - [x] name: intent-graph-mcp-server
  - [x] version: 1.0.0
  - [x] main: build/index.js
  - [x] types: build/index.d.ts
  - [x] files: 18 essential files
  - [x] keywords: 10 relevant keywords
  - [x] repository: GitHub URL
  - [x] license: MIT
- [x] .npmignore created (excludes tests, source, dev files)
- [x] Package preview verified (npm pack --dry-run)
- [x] Package size: ~36 KB ✅

---

## Publishing Commands

### Step 1: Login to npm (One-time setup)

```powershell
npm login
```

You'll be prompted for:
- Username
- Password
- Email
- 2FA code (if enabled)

### Step 2: Check Name Availability

```powershell
npm view intent-graph-mcp-server
```

**Expected:** `npm ERR! 404` (means name is available)

If taken, update `package.json` with a new name:
- `@spoyner/intent-graph-mcp`
- `intentgraph-mcp-server`
- `mcp-intent-graph-server`

### Step 3: Verify Who You Are

```powershell
npm whoami
```

Should show your npm username.

### Step 4: Publish!

```powershell
npm publish --access public
```

This will:
1. ✅ Run `npm run prepare` (builds automatically)
2. ✅ Pack 18 files into tarball
3. ✅ Upload to npm registry
4. ✅ Make public at npmjs.com

### Step 5: Verify Publication

Visit: https://www.npmjs.com/package/intent-graph-mcp-server

Check:
- [  ] README displays correctly
- [  ] Version is 1.0.0
- [  ] License shows MIT
- [  ] Files list looks correct

### Step 6: Test Installation

```powershell
# In a new directory
npm install intent-graph-mcp-server

# Or globally
npm install -g intent-graph-mcp-server
```

---

## Post-Publish Tasks

### Immediate
- [  ] Update this repo's README with npm badge
- [  ] Create GitHub release v1.0.0
- [  ] Tag the commit: `git tag v1.0.0 && git push --tags`
- [  ] Tweet/post announcement

### Soon
- [  ] Add npm download badge to README
- [  ] Update Cursor marketplace (if applicable)
- [  ] Post to MCP community forums
- [  ] Add to awesome-mcp list

---

## npm Badges for README

Add to top of README.md:

```markdown
[![npm version](https://badge.fury.io/js/intent-graph-mcp-server.svg)](https://www.npmjs.com/package/intent-graph-mcp-server)
[![npm downloads](https://img.shields.io/npm/dm/intent-graph-mcp-server.svg)](https://www.npmjs.com/package/intent-graph-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
```

---

## Troubleshooting

### Error: Need to login

```powershell
npm login
```

### Error: Package name exists

Change name in `package.json` and try again.

### Error: 402 Payment Required

Verify your npm email address.

### Error: Permission denied

```powershell
npm logout
npm login
```

---

## Future Updates

### Patch (1.0.1) - Bug fixes

```powershell
# Make your changes
npm version patch
git push && git push --tags
npm publish
```

### Minor (1.1.0) - New features

```powershell
# Add new features
npm version minor
git push && git push --tags
npm publish
```

### Major (2.0.0) - Breaking changes

```powershell
# Breaking changes
npm version major
git push && git push --tags
npm publish
```

---

## Quick Reference

```powershell
# Check current version
npm version

# View package info
npm view intent-graph-mcp-server

# Check who's logged in
npm whoami

# Publish
npm publish --access public

# View downloads
npm view intent-graph-mcp-server downloads

# Deprecate old version
npm deprecate intent-graph-mcp-server@1.0.0 "Please upgrade to 1.0.1"
```

---

## Success Metrics

After 24 hours:
- [ ] Downloads > 10
- [ ] GitHub stars > 5
- [ ] No critical issues reported

After 1 week:
- [ ] Downloads > 100
- [ ] GitHub stars > 20
- [ ] Community feedback collected

---

**Ready to share with the world!** 🚀

Once published, anyone can install with:
```bash
npm install intent-graph-mcp-server
```

And use it immediately in Cursor or Claude Desktop!

