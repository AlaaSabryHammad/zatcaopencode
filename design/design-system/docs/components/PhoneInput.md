# PhoneInput

Saudi mobile field with a fixed +966 prefix and 5X XXX XXXX grouping.

**Props:** `label`, `value` / `defaultValue` (9 digits, no leading 0), `onChange(digits)`, `hint`, `error`, plus Input props.

- Store E.164 (`+9665XXXXXXXX`). Used for OTP, so pair with an OTP step in onboarding.
