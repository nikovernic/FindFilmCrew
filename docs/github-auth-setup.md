# GitHub Authentication Setup

## Current Configuration

- **Remote:** HTTPS (`https://github.com/nikovernic/keep-writing-club.git`)
- **Credential Helper:** macOS Keychain (osxkeychain)
- **Git User:** nikovernic (nikovernic3@gmail.com)

## Option 1: Personal Access Token (Recommended)

### Steps:

1. **Create a Personal Access Token:**
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"
   - Name: `Crew Up Deployment`
   - Expiration: Choose appropriate (90 days, 1 year, or no expiration)
   - Scopes: Select `repo` (gives full repository access)
   - Click "Generate token"

2. **Copy the token immediately** (you won't see it again)

3. **Use the token when pushing:**
   ```bash
   git push origin main
   ```
   - Username: `nikovernic`
   - Password: **Paste your Personal Access Token** (not your GitHub password)

4. **macOS Keychain will store it:**
   - The token will be saved in macOS Keychain
   - You won't need to enter it again (until it expires)

## Option 2: Switch to SSH

If you prefer SSH:

1. **Check for existing SSH key:**
   ```bash
   ls -la ~/.ssh/id_*.pub
   ```

2. **If no key exists, generate one:**
   ```bash
   ssh-keygen -t ed25519 -C "nikovernic3@gmail.com"
   # Press Enter to accept default location
   # Optionally set a passphrase
   ```

3. **Add SSH key to GitHub:**
   ```bash
   cat ~/.ssh/id_ed25519.pub
   # Copy the output
   ```
   - Go to: https://github.com/settings/keys
   - Click "New SSH key"
   - Paste the key and save

4. **Change remote to SSH:**
   ```bash
   git remote set-url origin git@github.com:nikovernic/keep-writing-club.git
   ```

5. **Test connection:**
   ```bash
   ssh -T git@github.com
   # Should say: "Hi nikovernic! You've successfully authenticated..."
   ```

6. **Push:**
   ```bash
   git push origin main
   ```

## Option 3: GitHub CLI (gh)

Install and use GitHub CLI:

1. **Install:**
   ```bash
   brew install gh
   ```

2. **Authenticate:**
   ```bash
   gh auth login
   # Follow prompts to authenticate
   ```

3. **Push:**
   ```bash
   git push origin main
   ```

## Troubleshooting

### "Permission denied" error:
- Verify your token has `repo` scope
- Check token hasn't expired
- Try regenerating the token

### Keychain not saving credentials:
```bash
# Clear old credentials
git credential-osxkeychain erase
host=github.com
protocol=https
# Press Enter twice

# Then try push again
git push origin main
```

### Still having issues:
- Check GitHub status: https://www.githubstatus.com/
- Verify repository exists and you have push access
- Try: `git remote -v` to verify remote URL

---

**Quick Start (Recommended):**
1. Create Personal Access Token at https://github.com/settings/tokens
2. Run: `git push origin main`
3. Enter token as password when prompted
4. Done! Token saved in keychain for future use

