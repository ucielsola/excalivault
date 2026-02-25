default:
  @just --list

install:
  pnpm install

dev:
  pnpm dev

dev:firefox:
  pnpm dev:firefox

build:
  pnpm build

build:firefox:
  pnpm build:firefox

zip:
  pnpm zip

zip:firefox:
  pnpm zip:firefox

check:
  pnpm check

clean:
  rm -rf .wxt .output

status:
  @echo "Current branch:"
  @git branch --show-current
  @echo ""
  @echo "Current status:"
  @git status

test: build
  @echo "Build complete. Load extension in Chrome."
  @echo "Open chrome://extensions and enable Developer Mode"
  @echo "Click 'Load unpacked' and select .output/chrome-mv3"
