# NarouReadCounter

## 概要

この拡張機能は、小説家になろう(https://syosetu.com/)の読書データを記録するためのものです。画面上に表示した本文のみをカウントします。

## 機能

* コンテンツスクリプト "counter.js" を "ncode.syosetu.com" ドメインのページに注入します。
* ページ内のテキストを読んだ際に、そのテキストの長さをカウントし、ローカルストレージに保存します。
* 読書データをオプションページで表示します。

## 使用方法

1. 拡張機能をインストールします。
2. "ncode.syosetu.com" ドメインのページを開きます。
3. ページ内のテキストを読むと、自動的に読書データがカウントされます。
4. オプションページで読書データを確認できます。

## ファイル構成

- `counter.js`: ページ内のテキストをカウントし、ローカルストレージに保存するスクリプト。
- `options.js`: オプションページで読書データを表示するスクリプト。
- `options.html`: オプションページのHTMLファイル。
- `options.css`: オプションページのスタイルシート。
- `popup.js`: ポップアップを開いた際にオプションページを表示するスクリプト。
- `popup.html`: ポップアップのHTMLファイル。
- `lib/milligram.min.css`: ミリグラムCSSフレームワークのミニファイド版。
- `lib/browser-polyfill.min.js`: WebExtension用のポリフィル。
- `manifest.json`: 拡張機能の設定ファイル。

## インストール

### Firefox

1. このリポジトリをクローンします。
2. Firefoxのアドオンページ（`about:debugging#/runtime/this-firefox`）を開きます。
3. 「一時的なアドオンを読み込む」をクリックし、クローンしたディレクトリ内の `manifest.json` ファイルを選択します。

### Chrome

1. このリポジトリをクローンします。
2. Chromeの拡張機能ページ（`chrome://extensions/`）を開きます。
3. 「デベロッパーモード」を有効にし、「パッケージ化されていない拡張機能を読み込む」をクリックし、クローンしたディレクトリを指定します。

**注意**: この拡張機能は主にFirefox向けに開発されています。Chromeでの動作は保証されません。

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は [LICENSE](./LICENSE) を参照してください。

このプロジェクトでは以下のライブラリを使用しています：

- [Milligram](https://milligram.io/) - MITライセンス。
- [webextension-polyfill](https://github.com/mozilla/webextension-polyfill) - Mozilla Public License 2.0。