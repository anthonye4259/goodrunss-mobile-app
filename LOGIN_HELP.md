# Expo Login Help

## Try These Login Methods:

### Method 1: Standard Login
```bash
npx eas-cli login
```

**Then enter:**
- Email or username (the one you used to create Expo account)
- Password

**Common issues:**
- Make sure you're using the correct email/username
- Password is case-sensitive
- No extra spaces

---

### Method 2: Check Your Expo Account

**Go to:** https://expo.dev/login

Try logging in there first to confirm your credentials work.

If you can login on the website, use those SAME credentials in the terminal.

---

### Method 3: Reset Password

If you forgot your password:

1. Go to: https://expo.dev/forgot-password
2. Enter your email
3. Reset password
4. Then try `npx eas-cli login` again

---

### Method 4: Create New Account

If you're not sure about your account:

1. Go to: https://expo.dev/signup
2. Create new account
3. Use that to login

---

## What to Try:

1. **Check credentials on website first:** https://expo.dev/login
2. If that works, use EXACT same email/password in terminal
3. If it doesn't work, reset password at: https://expo.dev/forgot-password
4. Then run: `npx eas-cli login`

---

**Once logged in successfully, continue with:**
```bash
npx eas-cli build:configure
```

