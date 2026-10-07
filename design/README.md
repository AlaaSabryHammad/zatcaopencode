# ZatcaWeb — Design Handoff

<div dir="rtl">

## بالعربي

هذه الحزمة فيها التصميم الكامل لمنصة **ZatcaWeb** وبرومبت جاهز لـ Claude Code لبدء البرمجة باستخدام PostgreSQL.

**المحتويات**

| المجلد / الملف | الوصف |
| --- | --- |
| `CLAUDE_CODE_PROMPT.md` | البرومبت الكامل لـ Claude Code (Next.js + TypeScript + PostgreSQL + Prisma) مقسّم على 14 مرحلة. |
| `docs/DESIGN_SPEC.md` | مواصفات كل شاشة: المسار (route)، الأقسام، المكونات، الجداول والبيانات، وقواعد العمل. |
| `screens/index.html` | معرض صور لكل الشاشات (افتحه في المتصفح). |
| `screens/desktop/` · `devices/` · `dark/` | صور الشاشات: سطح المكتب، التابلت والموبايل، والوضع الداكن. |
| `screens/source/` | ملفات المصدر للشاشات مع البيانات التجريبية. |
| `design-system/tokens.json` · `tokens.css` | الألوان والخطوط والمسافات والظلال (فاتح وداكن). |
| `design-system/components/` | مكتبة المكونات المرجعية (48 مكوّن) + تعريفات TypeScript. |
| `design-system/previews/index.html` | معرض تفاعلي للمكونات. |
| `design-system/docs/` | دليل الهوية، العربية و RTL، حالات الامتثال، الرسوم البيانية، وتوثيق كل مكوّن. |
| `design-system/fonts/` · `assets/` | الخطوط، الشعارات، والأيقونات. |

**طريقة الاستخدام مع Claude Code**

1. أنشئ مجلد مشروع جديد وانسخ هذه الحزمة بداخله باسم `design/`.
2. شغّل Docker (لـ PostgreSQL و Redis و MinIO).
3. افتح Claude Code داخل مجلد المشروع، والصق محتوى `CLAUDE_CODE_PROMPT.md` (من بعد الخط الفاصل).
4. بعد كل مرحلة: راجع، شغّل التطبيق، اعمل commit، ثم اكتب `continue with phase 2` وهكذا.

> ملاحظة مهمة: التكامل الفعلي مع منصة فاتورة (ZATCA) لازم يتبني من الوثائق والـ SDK الرسمية الحالية. التصميم لا يعرض أي حالة "مقبول" أو "متوافق" إلا بعد نتيجة تحقق حقيقية.

</div>

## English

This package contains the complete **ZatcaWeb** design and a ready-to-paste build prompt for Claude Code (PostgreSQL + Prisma).

| Path | What it is |
| --- | --- |
| `CLAUDE_CODE_PROMPT.md` | Full build prompt: stack, repo layout, multi-tenancy + RLS, Prisma data model, business rules, e-invoicing honesty rules, seed data, 14 phases with acceptance criteria. |
| `docs/DESIGN_SPEC.md` | Screen-by-screen spec: route, sections, components, entities, domain rules. |
| `screens/` | Full-page renders (desktop, tablet/mobile, dark) + `index.html` gallery + `.dc.html` sources with sample data. |
| `design-system/` | Tokens (JSON + CSS), 48 reference components (`bundle.js`, `index.d.ts`), standalone previews, docs, fonts, logos, icons. |

**Quick start:** put this folder at `./design/` in a new repo, start Docker, open Claude Code in the repo root and paste the prompt from `CLAUDE_CODE_PROMPT.md`. Review and commit after each phase, then say `continue with phase N`.

Sample data uses a fictional company, "شركة آفاق التقنية المحدودة" (VAT 310123456700003). Bracketed values such as `[SAR —]` are placeholders for real business facts.
