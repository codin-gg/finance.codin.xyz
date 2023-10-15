# finance.codin.xyz 📈
An open-source cryptocurrency data service, with daily-updated data in multiple formats. Accessible, developer-friendly, and Google Sheets and RSS reader-friendly.

[![GitHub Status](https://img.shields.io/github/actions/workflow/status/codin-gg/finance.codin.xyz/tests.yml?style=for-the-badge&colorB=44CC11)](https://github.com/codin-gg/finance.codin.xyz/actions/workflows/tests.yml) [![Dependencies](https://img.shields.io/badge/dependencies-none-blue.svg?style=for-the-badge&colorB=44CC11)](https://github.com/codin-gg/finance.codin.xyz/blob/main/package.json) [![Coverage Status](https://img.shields.io/coveralls/codin-gg/finance.codin.xyz.svg?style=for-the-badge)](https://coveralls.io/github/codin-gg/finance.codin.xyz?branch=main) [![Linter](https://img.shields.io/badge/coding%20style-standard-brightgreen.svg?style=for-the-badge)](http://standardjs.com/)

[![node](https://img.shields.io/badge/node-20%2B-blue.svg?style=for-the-badge)](https://nodejs.org/docs) [![npm](https://img.shields.io/badge/node-10%2B-blue.svg?style=for-the-badge)](https://nodejs.org/docs) [![license](https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge&colorB=007EC6)](https://spdx.org/licenses/MIT)

## Currently supported formats 📋
- [x] JSON
- [x] CSV
- [x] ~~XML (deprecated)~~
- [x] ~~JSONL (deprecated)~~

Notes: Those deprecations are due to [Github Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages#limits-on-use-of-github-pages) disk space limitations. For now, we rather'd rather like to focus on having more timeframes. btw `csv` is the least disk hungry google sheets compatible format 🚀

## Currently supported routes
- [x] `/api/latest.{format:json,csv} → [[{id}, {base id}, {base name}, {quote id}, {quote name}, {status}, {price}, {volume 24h}, {price % 24h}, {volume % 24h}, {cached}], ...]`
- [x] `/api/{id}/{interval:1d,1w,1m,1y}.{format:json,csv} → [[{date}, {open}, {high}, {low}, {close}, {volume}], ...]`
- [x] `/api/{id}/{year?}/{month?}/{day?}/{interval:1d}.{format:json,csv} → [[{date}, {open}, {high}, {low}, {close}, {volume}], ...]`

## Donations 🙏
- **BTC:** bc1qp8v7qleltzas46h3zmsw0epflmkks5v3c3f0cq <!-- codin.x -->
- **ETH:** 0x0Ce2dE22C755Ea3828f0c845769781a49557c834 <!-- codin.x -->
