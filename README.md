# Shopware CLI GitHub Action

Installs Shopware CLI in your GitHub Actions.


## Usage

```yaml
name: shopware-cli

on:
  pull_request:
  push:

permissions:
  contents: write

jobs:
  goreleaser:
    runs-on: ubuntu-latest
    steps:
      -
        name: Checkout
        uses: actions/checkout@v3
        with:
          fetch-depth: 0
      -
        name: Set up Go
        uses: actions/setup-go@v4
      -
        name: Install Shopware CLI
        uses: FriendsOfShopware/shopware-cli@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      -
        name: Build and Package Extension
        run: shopware-cli extension zip .
```

