/// <reference path="scripts/typings/jquery/jquery.d.ts" />
var BlogBib = (function () {
    function BlogBib(opt) {
        if (opt === void 0) { opt = {}; }
        this.width_cover = 170;
        this.width = 600;
        this.endpoint = "http://api.openbd.jp/v1/";
        this.amazon_links = {};
        this.db_links_id = {};
        this.cover_mode = "db";
        this.link_mode = "amazon";
        this.amazon_account = null;
        $.extend(this, opt);
    }
    BlogBib.prototype.isASIN = function (str) {
        if (str.match(/^[^0-9]/)) {
            return true;
        }
        else {
            return false;
        }
    };
    // yyyymmdd => yyyy/mm/dd
    BlogBib.prototype.convDate = function (date) {
        var y = date.substr(0, 4);
        var m = date.substr(4, 2);
        var d = date.substr(6, 2);
        return y + "/" + m + "/" + d;
    };
    BlogBib.prototype.toISBN10 = function (isbn) {
        if (isbn.length > 10) {
            var digits = [];
            digits = isbn.substr(3, 9).split("");
            var sum = 0;
            var temp, check_digit;
            for (var i = 0; i < 9; i++) {
                sum += digits[i] * (10 - i);
            }
            temp = 11 - (sum % 11);
            if (temp == 10) {
                check_digit = 'X';
            }
            else if (temp == 11) {
                check_digit = 0;
            }
            else {
                check_digit = temp;
            }
            digits.push(check_digit);
            return digits.join("");
        }
        else {
            return isbn;
        }
    };
    BlogBib.prototype.load_db = function () {
        var _this = this;
        var isbn_list = [];
        var name_list = [];
        for (var id in this.db_links_id) {
            name_list.push(this.db_links_id[id]);
            isbn_list.push(id);
        }
        var args = "isbn=" + isbn_list.join(",");
        $.ajax({
            type: "POST",
            url: this.endpoint + "get",
            data: args,
            success: function (msg) {
                for (var i = 0; i < msg.length; i++) {
                    console.log(msg[i]);
                    // creating author info
                    var author = msg[i]["summary"]["author"];
                    var pubdate = _this.convDate(msg[i]["summary"]["pubdate"]);
                    // creating cover info
                    var cover;
                    if (_this.cover_mode == "amazon") {
                        // ISBN-10 is used in Amazon URL
                        cover = _this.getAmazonCover(_this.toISBN10(isbn_list[i]));
                    }
                    else {
                        cover = '<img src= "' + msg[i]["summary"]["cover"] + '" alt= "image" />';
                    }
                    // creating book info
                    var book_info = "";
                    var contents = msg[i]["onix"]["CollateralDetail"]["TextContent"];
                    if (contents) {
                        // all contents are contcatnated
                        book_info += "<li>";
                        for (var j = 0; j < contents.length; j++) {
                            book_info += "<p>" + contents[j]["Text"] + "</p>";
                        }
                        book_info += "</li>";
                    }
                    // URL & Title
                    var book_url = _this.getAmazonURL(_this.toISBN10(isbn_list[i]));
                    var title = '<a href="' + book_url + '" target="_blank">' + msg[i]["summary"]["title"] + '</a>';
                    var isbn13 = msg[i]["onix"]["ProductIdentifier"]["IDValue"];
                    var price_u = msg[i]["onix"]["ProductSupply"]["SupplyDetail"]["Price"][0]["CurrencyCode"];
                    if (price_u == "JPY") {
                        price_u = "円";
                    }
                    else {
                        price_u = " (" + price_u + ")";
                    }
                    var price = msg[i]["onix"]["ProductSupply"]["SupplyDetail"]["Price"][0]["PriceAmount"];
                    //var book_info = msg[i]["onix"]["CollateralDetail"]["TextContent"][0]["Text"];
                    var name = name_list[i];
                    var info = '<ul style="list-style-type: none;margin: 0px 0px 0px 10px;padding: 0px 0px 0px 0px;">' +
                        "<li>" + title + "</li>" +
                        "<li>作者　：" + author + "</li>" +
                        "<li>出版社：" + msg[i]["summary"]["publisher"] + "</li>" +
                        "<li>出版日：" + pubdate + "</li>" +
                        "<li>価格　：" + price + price_u + "</li>" +
                        //"<li>ISBN-10：" + this.toISBN10(isbn13) + "</li>" +
                        //"<li>ISBN-13：" + isbn13 + "</li>" +
                        book_info +
                        "</ul>";
                    $("#" + name).append('<table border="0" width="' + _this.width + '"><tr><td width= "' + _this.width_cover + '" valign="top">' + cover + '</td><td valign="top">' + info + '</td></tr>');
                }
            },
            error: function (req, sts, err) {
                console.log(req, sts, err);
            }
        });
    };
    BlogBib.prototype.load_amazon = function () {
        for (var asin in this.amazon_links) {
            $("#amazon_" + asin).append(this.amazon_links[asin]);
        }
    };
    BlogBib.prototype.createLink = function (id) {
        if (this.isASIN(id)) {
            this.createAmazonLink(id);
        }
        else {
            this.createDBLink(id);
        }
    };
    BlogBib.prototype.createDBLink = function (isbn) {
        this.db_links_id[isbn] = "db_" + isbn;
        document.write('<div class="blogbib" id="' + "db_" + isbn + '"></div>');
    };
    BlogBib.prototype.getAmazonURL = function (asin) {
        if (this.amazon_account) {
            return "https://www.amazon.co.jp/dp/" + asin + "/ref=as_li_ss_tl?tag=" + this.amazon_account;
        }
        else {
            return "https://www.amazon.co.jp/dp/" + asin + "/ref=as_li_ss_tl?";
        }
    };
    BlogBib.prototype.createAmazonURL = function (asin, text) {
        var link = this.getAmazonURL(asin);
        var html_str = '<a href="' + link + '" target="_blank">' + text + '</a>';
        document.write(html_str);
    };
    BlogBib.prototype.getAmazonLink = function (asin) {
        var opt = {
            lt1: "_blank",
            bc1: "f0f0f0",
            IS2: "1",
            bg1: "f0f0f0",
            fc1: "080808",
            lc1: "0000FF",
            o: "9",
            p: "8",
            l: "as4",
            m: "amazon",
            f: "ifr",
            ref: "ss_til",
            asins: asin
        };
        //if (this.amazon_account) {
        $.extend(opt, {
            t: this.amazon_account
        });
        //}
        var args = [];
        for (var key in opt) {
            var val = opt[key];
            args.push(key + "=" + val);
        }
        var html_str = '<iframe src="http://rcm-fe.amazon-adsystem.com/e/cm?' + args.join("&") + '" style="width:120px;height:240px;" scrolling="no" marginwidth="0" marginheight="0" frameborder="0"></iframe>';
        return html_str;
    };
    BlogBib.prototype.getAmazonCover = function (asin) {
        var html_str;
        if (this.amazon_account) {
            html_str = '<a href="https://www.amazon.co.jp/dp/' + asin + '/ref=as_li_ss_il?&linkCode=li3&tag=' + this.amazon_account + '" target="_blank">'
                + '<img border= "0" src= "//ws-fe.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=' + asin + '&Format=_SL250_&ID=AsinImage&MarketPlace=JP&ServiceVersion=20070822&WS=1&tag=' + this.amazon_account + '" >'
                + '</a>'
                + '<img src= "https://ir-jp.amazon-adsystem.com/e/ir?t=' + this.amazon_account + '&l=li3&o=9&a=' + asin + '" width= "1" height= "1" border= "0" alt= "" style= "border:none !important; margin:0px !important;" />';
        }
        else {
            html_str = '<a href="https://www.amazon.co.jp/dp/' + asin + '/ref=as_li_ss_il?&linkCode=li3" target="_blank">'
                + '<img border= "0" src= "//ws-fe.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=' + asin + '&Format=_SL250_&ID=AsinImage&MarketPlace=JP&ServiceVersion=20070822&WS=1" >'
                + '</a>'
                + '<img src= "https://ir-jp.amazon-adsystem.com/e/ir?l=li3&o=9&a=' + asin + '" width= "1" height= "1" border= "0" alt= "" style= "border:none !important; margin:0px !important;" />';
        }
        return html_str;
    };
    BlogBib.prototype.createAmazonLink = function (asin) {
        this.amazon_links[asin] = this.getAmazonLink(asin);
        document.write('<div class="blogbib" id="amazon_' + asin + '"></div>');
    };
    return BlogBib;
})();
var blogbib = new BlogBib();
window.onload = function () {
    blogbib.load_amazon();
    blogbib.load_db();
};
//# sourceMappingURL=blogbib.js.map