# コースを追加する方法

ビルドツールは不要です。作品のJSON・画像を追加し、`data/courses.json`に目録を1件足します。既存のコースID・地点ID・篇IDは保存記録に使うため変更しないでください。

## 1. 調査と構成

原文の底本・公開条件・原著者、実際の旅程、章の叙述順、各句の作者を確認します。作品の語りと歴史上の旅程に差があれば別々に管理します。再訪する地点には別のIDを付けます。詳細不明の道筋を断定しないでください。

距離は全地点で同じ算定方法を使い、`distanceNote`に根拠を書きます。代表点を結ぶ換算値ならその旨を明示します。既存コースの累計距離を変えると、保存済みの同じ歩行距離でも現在地が変わります。利用者向け変更履歴が必要です。

## 2. 作品ファイル

既存JSONを雛形にします。文字列にHTMLを入れる必要はありません。

|項目|内容|
|---|---|
|schemaVersion|現在は1|
|id|変更しない英数字・ハイフン等のID|
|title / author / traveler / summary|作品名、著者、旅人、紹介|
|totalKm|終点の累計kmと一致|
|cover / coverCaption|画像の相対パス、種別と説明|
|progressImage|左向きの現代イメージ画像の相対パス|
|distanceNote / routeNote / readingNote|距離の算定、旅程の注意、本文編集方針|
|points|旅程順の地点配列|
|readings|読書順の本文配列|
|images|画像IDをキーとする画像情報オブジェクト|
|sources|資料配列（id、title、url、note）|
|originalsFile|任意。長い原文の別JSONを必要時だけ取得|

### pointsの各要素

`id, name, lat, lon, km, nextKm, location, note, sourceIds`を設定します。最初のkmは0、終点のnextKmは0。途中のnextKmは次地点kmとの差です。`imageId`は任意。`history, landmark, specialty, road, sources`を付けると詳細カードで表示されます。

舟の経路等の補助点には、到着側地点の`via`を使えます（`[[lat,lon], …]`）。概略線の形を補うもので、史料で確認していない航路の復元と称してはいけません。

### readingsの各要素

`id, pointId, order, title, part, original, modern, background, poems, sourceIds`を設定します。`modern`は段落ごとの文字列配列、`poems`は句がなければ空配列です。`pointId`が解放地点になります。`place, placeNote, sources, historicalImageId`も利用できます。本文の要約だけで済ませず、読める長さの現代語化を用意し、省略範囲を注記してください。

原文を分離する場合は`rawFiles`に別JSONのキー配列を持たせます。別JSONはキーごとに`title, url, text`を持つオブジェクトです。現行の長文欄はプレーンテキストを安全に表示します。

### poemsの各要素

`text, reading, author, modern, place, context, keywords, technique, appreciation, background, textRelation, variants, sourceIds`。作者を推定で補わないでください。句が本文内の句か、同行者の句か、後世の関連句かを明示してください。`variants`には必要な異同や解釈の幅を記します。

### imagesの各要素

`id, src, title, kind, author, source, license, licenseUrl, modification, width, height, sizeBytes`。`highres`は任意の高精細版リンク。地点の `imageId` に指定した画像は、種別を問わず本文の上に出ます。地点の `imageNote` に、地域参考や年代の違いなどを明記します。原作挿絵・原作本文頁・後世の絵・参考風景画は正しく区別してください。

画像は個別WebP、通常1400px以下・500KB以下を目安とします。画像の出典ページと利用条件を確認して保存し、`docs/IMAGE_LICENSES.md`も更新します。Base64埋め込みは使いません。

## 3. 目録に追加

`data/courses.json`の配列に`id, title, author, totalKm, summary, cover, coverCaption, file, readingCount, pointCount`を追加します。`file`は`data/作品ID.json`などの相対パスです。起動画面は目録だけを読み、本文は作品を選んだ時に取得します。保存領域はIDごとに自動で分かれます。

## 4. 確認と公開

- 全pointId・imageId・sourceIdsが実在すること、kmが単調増加すること、終点がtotalKmと一致することを確認。
- 読書の前後移動、完読、先読み、記録追加・修正・削除、作品切替後の独立した保存を確認。
- 地図の全点・現在位置・地理背景・分岐や再訪を確認。
- 320px幅・文字サイズ24pxでも読めるか確認。
- HTTPS環境でオフライン保存、再読み込み、JSON入出力を確認。
- `sw.js`のキャッシュ名と`js/app.js`のオフライン保存用キャッシュ名を同時に更新。画像を差し替える場合はファイル名も変えると古い画像との混在を防げます。

全ファイルを公開元へ配置します。機能追加で保存スキーマを変える場合は`storage.js`に移行処理を追加し、旧保存データを破壊しないことを検証してください。
