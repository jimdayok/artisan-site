# Portal report data contract

The Artisan portal receives month-level measures from the Power BI export. The reporting periods must be filtered with `Date[Date]`:

- PPM: the full month two months before the refresh month.
- PM: the full month immediately before the refresh month.
- CM: the refresh month through the refresh date.

## AR production mix

Use `Intel[preferred AR jobs]` for in-house AR orders and `Intel[non-preferred AR Jobs]` for outsourced AR orders. The export must provide these six numeric fields at both group and location grain:

- `[ppm_preferred_ar_jobs]`
- `[pm_preferred_ar_jobs]`
- `[cm_preferred_ar_jobs]`
- `[ppm_non_preferred_ar_jobs]`
- `[pm_non_preferred_ar_jobs]`
- `[cm_non_preferred_ar_jobs]`

The portal calculates each percentage from preferred plus non-preferred AR jobs for the same period. It does not use total jobs as the AR denominator.

## Unity brand usage

The export must provide Unity order counts at group and location grain:

- `[ppm_unity_orders]`
- `[pm_unity_orders]`
- `[cm_unity_orders]`

The generator also accepts the equivalent `*_unity_jobs` names for backward compatibility. Primary PAL brand labels are not treated as order counts.

## VSP mix

VSP share is calculated as VSP jobs divided by total jobs for the same record and period. Non-VSP jobs are calculated as total jobs minus VSP jobs. Total jobs already includes VSP jobs.
