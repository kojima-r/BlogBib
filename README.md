# BlogBib 

書誌情報・書影をブログ等でいい感じに表示するための Java script です。[openBDプロジェクト](https://openbd.jp/)を利用させていただいています．

## サンプル
index.html が利用の仕方になります．
．
## 使い方

本プログラムは jquery を利用していますので，jquery とともに blogbib.jsを読み込むようにhtmlを記述します．

```html
<script src="https://code.jquery.com/jquery-3.1.1.min.js"></script>
<script src="blogbib.js"></script>
```

さらに，HTML中の書誌情報を表示したい部分で script タグを用いて，以下のように記述します．
createLinkメソッドの引数は表示したい書籍のISBN番号になります．
ISBN-10とISBN-13の両方に対応しています．

```html
<script>blogbib.createLink("4103503610");</script>
```
簡易的な使い方は以上です．

以下のようにオプションを渡すことで表示の仕方を変更することができます．

```html
<script>
var blogbib = new BlogBib({ amazon_account: "xxxxx",cover_mode: "amazon", width_cover: 170, width: 600});
</script>
```

ここで使っている変数名「blogbib」は内部的に利用している変数名なので変更できません．

オプションとしては以下の４つが利用できます．
* amazon_account: amazon への広告用リンクを作成するときに利用するアカウント名です．指定しなくても問題ありません（広告用でない通常のリンクであれば作成できるため）．
* cover_mode:書影（カバー画像）の表示元です．"amazon"を指定すると Amazon の物を使いますが，"db"もしくは「指定なし」の場合は[openBDプロジェクト](https://openbd.jp/)のものを使います．
* width_cover:書影の表示サイズ（横幅）を指定します．
* width:全体の横幅を指定します．（高さは表示内容に応じて自動決定されます）

## できないこと（もしくはTODO）

* Amazon と OpenBD 以外のサービスの利用
* 細かいデザインの変更

## ライセンス

All code licensed under the [MIT License](http://www.opensource.org/licenses/mit-license.php).

