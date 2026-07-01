# 📝 Form Handling

A registration form demonstrating validation, multiple field types, error display, async submission, and double-submit protection.

---

## index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Form Handling</title>
  <style>
    page { max-width: 420px; margin: 0 auto; padding: 32px 16px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif; }

    h1 { font-size: 22px; margin-bottom: 24px; }

    .field { margin-bottom: 18px; }

    label { display: block; font-size: 14px; font-weight: 500; margin-bottom: 6px; color: #333; }

    input[type="text"],
    input[type="email"],
    input[type="password"],
    select {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 16px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
    }

    input:focus, select:focus { outline: none; border-color: #007aff; }

    .error { color: #ff3b30; font-size: 13px; margin-top: 4px; display: none; }
    .error.visible { display: block; }

    .checkbox-row { display: flex; align-items: center; gap: 10px; font-size: 15px; }

    .submit-btn {
      width: 100%;
      padding: 13px;
      background: #007aff;
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 8px;
    }

    .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .form-error {
      background: #fff2f2;
      border: 1px solid #ffcccc;
      border-radius: 8px;
      padding: 12px;
      color: #cc0000;
      font-size: 14px;
      margin-bottom: 16px;
      display: none;
    }

    .form-error.visible { display: block; }

    #success {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      text-align: center;
      gap: 12px;
    }

    .success-icon { font-size: 64px; }
  </style>
</head>
<body>

<app>
  <page name="register" id="register">
    <h1>Create Account</h1>

    <div class="form-error" id="formError"></div>

    <form action="submitRegistration">
      <div class="field">
        <label for="name">Full name</label>
        <input type="text" id="name" name="name" placeholder="Jane Smith">
        <div class="error" id="nameError">Please enter your name</div>
      </div>

      <div class="field">
        <label for="email">Email</label>
        <input type="email" id="email" name="email" placeholder="jane@example.com">
        <div class="error" id="emailError">Please enter a valid email</div>
      </div>

      <div class="field">
        <label for="password">Password</label>
        <input type="password" id="password" name="password" placeholder="At least 8 characters">
        <div class="error" id="passwordError">Password must be at least 8 characters</div>
      </div>

      <div class="field">
        <label for="role">Role</label>
        <select id="role" name="role">
          <option value="">Select a role</option>
          <option value="developer">Developer</option>
          <option value="designer">Designer</option>
          <option value="manager">Manager</option>
        </select>
        <div class="error" id="roleError">Please select a role</div>
      </div>

      <div class="field">
        <div class="checkbox-row">
          <input type="checkbox" id="terms" name="terms" value="agreed">
          <label for="terms" style="margin-bottom:0">I agree to the terms of service</label>
        </div>
        <div class="error" id="termsError">You must agree to the terms</div>
      </div>

      <button type="submit" class="submit-btn" id="submitBtn">Create Account</button>
    </form>
  </page>

  <page name="success" id="success">
    <div class="success-icon"></div>
    <h1>Account Created</h1>
    <p id="successMessage"></p>
  </page>
</app>

<script src="clera.js"></script>
<script>
  function clearErrors(context) {
    ["nameError","emailError","passwordError","roleError","termsError","formError"].forEach(id => {
      context.query("#" + id).element.classList.remove("visible");
    });
  }

  function showError(context, id, message) {
    const el = context.query("#" + id).element;
    if (message) el.textContent = message;
    el.classList.add("visible");
  }

  function validate(values, context) {
    let valid = true;

    if (!values.name || !values.name.trim()) {
      showError(context, "nameError");
      valid = false;
    }

    if (!values.email || !values.email.includes("@")) {
      showError(context, "emailError");
      valid = false;
    }

    if (!values.password || values.password.length < 8) {
      showError(context, "passwordError");
      valid = false;
    }

    if (!values.role) {
      showError(context, "roleError");
      valid = false;
    }

    if (!values.terms) {
      showError(context, "termsError");
      valid = false;
    }

    return valid;
  }

  async function submitRegistration(context) {
    clearErrors(context);

    if (!validate(context.values, context)) return;

    const btn = context.query("#submitBtn").element;
    btn.disabled = true;
    btn.textContent = "Creating account...";

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));

      const name = context.values.name.trim().split(" ")[0];
      context.navigate("success", { name });

    } catch (error) {
      showError(context, "formError", "Something went wrong. Please try again.");
      btn.disabled = false;
      btn.textContent = "Create Account";
    }
  }

  function showSuccess(context) {
    const name = context.params.name || "there";
    context.query("#successMessage").text(`Welcome, ${name}! Your account is ready.`);
  }

  app.page("success", { onShow: showSuccess });
</script>

</body>
</html>
```

---

## What this demonstrates

- Multiple field types: text, email, password, select, checkbox
- Client-side validation with per-field error messages
- `context.values` for all field types including checkbox
- Async form submission with loading state
- Disabling the submit button during async work
- Navigating with params after success
- `app.page()` for attaching a lifecycle hook in JavaScript
- `context.params` on the success page

---

## Next

[07 Dashboard](./07-dashboard.md)
