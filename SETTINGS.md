# ארכיטקטורת ההגדרות — טרי לי

> ⚠️ **קרא לפני שאתה נוגע בהגדרות של מודול כלשהו.**
> הכלל כאן נשבר בעבר בשלושה מודולים במקביל, ומחק הגדרות בשקט במשך חודשים.

## הכלל היחיד

**מקור האמת להגדרות הוא הענן** (טבלת `app_settings` ב-Supabase).
`cloud-sync.js` מסנכרן אותן: מושך בטעינה, כותב ל-`localStorage`, ודוחף חזרה בכל שמירה.

## המפה

| מודול | קובץ | מפתח localStorage | מפתח בענן |
|---|---|---|---|
| מחשבון אריזה | `index.html` | `trili_settings` | `packing:trili_settings` |
| חלוקת הזמנות | `order-split.html` | `alumim_set` (+`alumim_ledger`, `alumim_fruit`) | `order-split:alumim_set` … |
| סידור נהגים | `drivers.html` | `drv_set` | `drivers:drv_set` |
| חשבשבת | `hashavshevet/index.html` | `hashSettings` | `hashav:hashSettings` |

**כל מודול עם הגדרות מקומיות חייב:**

1. לטעון את `cloud-sync.js` **כסקריפט ראשון** ב-`<head>`
2. שהמפתח שלו יופיע ב-`MAP` שבתוך `cloud-sync.js`

## הבאג שהיה — אל תחזיר אותו

לשלושת המודולים היה קובץ הגדרות סטטי בריפו (`settings.json`, `settings2.json`, `settings3.json`)
שנטען בכל טעינה ו**דרס את ההגדרות השמורות ללא תנאי**:

```js
// ❌ אסור — מוחק בשקט כל עריכה של המשתמש בכל רענון
const j = await (await fetch('settings2.json')).json();
S = Object.assign({}, DEFAULTS, j);
```

התוצאה: המשתמש עורך הגדרה, לוחץ שמור, זה נראה תקין — ובטעינה הבאה זה חוזר אחורה.
כך גם "כובה" מצב הקיץ שוב ושוב, וכך הגדרות סידור הנהגים מעולם לא הגיעו לענן.

**הצורה הנכונה — זרע בלבד:**

```js
// ✅ נטען רק כשאין עדיין שום הגדרות שמורות
var hasSaved = !!localStorage.getItem('alumim_set');
if (hasSaved) return;                     // ← השומר הקריטי
const j = await (await fetch('settings2.json')).json();
S = Object.assign({}, DEFAULTS, j);
```

קובצי `settings*.json` הם **זרע ראשוני בלבד** — למחשב חדש או למצב ללא חיבור.
הם אינם מקור אמת ואסור להם לדרוס דבר.

## סודות מקומיים

מפתחות שהם ספציפיים למחשב (למשל `gemini_key` / `gemini_proxy_url` בסידור נהגים)
נשמרים במפתח נפרד `drv_ai` שאיננו ב-`MAP` — כדי שסנכרון ההגדרות לא ימחק אותם.
**אל תחזיר סודות לתוך הבלוב המסונכרן.**

## צ'קליסט לפני הוספת הגדרה/מודול חדש

- [ ] המודול טוען `cloud-sync.js` ראשון ב-`<head>`
- [ ] מפתח ה-localStorage נוסף ל-`MAP` ב-`cloud-sync.js`
- [ ] אין שום `fetch` של קובץ סטטי שדורס הגדרות ללא שומר `hasSaved`
- [ ] סודות ספציפיים למחשב יושבים במפתח נפרד שאינו ב-`MAP`
- [ ] נבדק: עורכים ערך, שומרים, מרעננים — הערך שרד
