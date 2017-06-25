/// <reference path="scripts/typings/jquery/jquery.d.ts" />

class BlogBib {
    endpoint: string;
    amazon_account: string;
    link_count: number;
    amazon_links: Object;
    db_links_id: Object;
    cover_mode: string;
    link_mode: string;
    amazon_link_mode: string;
    width_cover: number = 150;
    width_text: number = 300;
    width: number = 450;
    constructor(opt: Object = {}) {
        this.endpoint = "http://api.openbd.jp/v1/";
        this.amazon_links = {};
        this.db_links_id = {};
        this.cover_mode = "amazon";
        this.link_mode = "amazon";
        this.amazon_link_mode = "cover";
        this.amazon_account = null;
        $.extend(this, opt);
    }
    isASIN(str: string) {
        if (str.match(/^[^0-9]/)) {
            return true;
        } else {
            return false;
        }
    }
    // yyyymmdd => yyyy/mm/dd
    convDate(date: string) {
        var y = date.substr(0, 4);
        var m = date.substr(4, 2);
        var d = date.substr(6, 2);
        return y + "/" + m + "/" + d;
    }
    toISBN10(isbn: string) {
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
            } else if (temp == 11) {
                check_digit = 0;
            } else {
                check_digit = temp;
            }
            digits.push(check_digit);
            return digits.join("");
        } else {
            return isbn;
        }
    }
    load_db() {
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
            success: (msg) => {
                for (var i = 0; i < msg.length; i++) {

                    // creating author info
                    var author = msg[i]["summary"]["author"];
                    var pubdate = this.convDate(msg[i]["summary"]["pubdate"]);

                    // creating cover info
                    var cover: string;
                    if (this.cover_mode == "amazon") {
                        // ISBN-10 is used in Amazon URL
                        cover = this.getAmazonCover(this.toISBN10(isbn_list[i]));
                    } else {
                        cover = '<img src= "' + msg[i]["summary"]["cover"] + '" alt= "image" />'
                    }

                    // creating book info
                    var book_info = ""
                    var contents = msg[i]["onix"]["CollateralDetail"]["TextContent"];
                    if (contents) {
                        // all contents are contcatnated
                        book_info += "<li>"
                        for (var j = 0; j < contents.length; j++) {
                            book_info += "<p>" + contents[j]["Text"] + "</p>"
                        }
                        book_info += "</li>"
                    }
                    // URL & Title
                    var book_url = this.getAmazonURL(this.toISBN10(isbn_list[i]));
                    var title: string = '<a href="' + book_url + '" target="_blank">' + msg[i]["summary"]["title"] + '</a>'
                    var isbn13: string = msg[i]["onix"]["ProductIdentifier"]["IDValue"];
                    var price_u: string="";
                    var price: string =""
                    try{
                        price_u = msg[i]["onix"]["ProductSupply"]["SupplyDetail"]["Price"][0]["CurrencyCode"];
                        if (price_u == "JPY") {
                            price_u = "円";
                        } else {
                            price_u = " (" + price_u + ")";
                        }
                        price= msg[i]["onix"]["ProductSupply"]["SupplyDetail"]["Price"][0]["PriceAmount"];
                    } catch (err) {
                        console.log(err);
                    }
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
                    var text_head = '<table border="0" width="' + this.width + '"><tr>';
                    var text_foot = '</tr></table>';
                    var text1 = '<td width= "' + this.width_cover + '" valign="top">' + cover + '</td>'
                    var text2 = '<td width= "' + this.width_text + '" valign= "top"> ' + info + ' </td>'
                    $("#" + name).append(text_head + text1 + text2 + text_foot);
                }
            },
            error: (req, sts, err) => {
                console.log(req, sts, err);
            }
        });
    }
    load_amazon() {
        for (var asin in this.amazon_links) {
            $("#amazon_" + asin).append(this.amazon_links[asin]);
        }
    }
    createLink(id: string, lnk: any= null) {
        if (this.isASIN(id)) {
            this.createAmazonLink(id, lnk);
        } else {
            this.createDBLink(id, lnk);
        }
    }
    createDBLink(isbn: string, element: any = null) {
        this.db_links_id[isbn] = "db_" + isbn;
        var html_str:string='<div class="blogbib" id="' + "db_" + isbn + '"></div>';
        if (element == null) {
            document.write(html_str);
        } else {
            element.append(html_str);
        }
        
    }
    getAmazonURL(asin: string) {
        if (this.amazon_account) {
            return "https://www.amazon.co.jp/dp/" + asin + "/ref=as_li_ss_tl?tag=" + this.amazon_account;
        } else {
            return "https://www.amazon.co.jp/dp/" + asin + "/ref=as_li_ss_tl?";
        }
    }
    createAmazonURL(asin: string, text: string, element: any=null) {
        var link = this.getAmazonURL(asin);
        var html_str: string = '<a href="' + link + '" target="_blank">' + text + '</a>'
        if (element == null) {
            document.write(html_str);
        } else {
            element.append(html_str);
        }
    }
    getAmazonLink(asin: string) {
        var opt = {
            lt1: "_blank",
            bc1: "f0f0f0",// frame color
            IS2: "1",
            bg1: "f0f0f0",// background color
            fc1: "080808",// character color
            lc1: "0000FF",// link color
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
        })
        //}
        var args = [];
        for (var key in opt) {
            var val = opt[key];
            args.push(key + "=" + val);
        }
        var html_str: string = '<iframe src="http://rcm-fe.amazon-adsystem.com/e/cm?' + args.join("&") + '" style="width:120px;height:240px;" scrolling="no" marginwidth="0" marginheight="0" frameborder="0"></iframe>';
        return html_str;
    }
    getAmazonCover(asin) {
        var html_str: string;
        if (this.amazon_account) {
            html_str = '<a href="https://www.amazon.co.jp/dp/' + asin + '/ref=as_li_ss_il?&linkCode=li3&tag=' + this.amazon_account + '" target="_blank">'
                + '<img border= "0" src= "//ws-fe.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=' + asin + '&Format=_SL250_&ID=AsinImage&MarketPlace=JP&ServiceVersion=20070822&WS=1&tag=' + this.amazon_account + '" >'
                + '</a>'
                + '<img src= "https://ir-jp.amazon-adsystem.com/e/ir?t=' + this.amazon_account + '&l=li3&o=9&a=' + asin + '" width= "1" height= "1" border= "0" alt= "" style= "border:none !important; margin:0px !important;" />'
        } else {
            html_str = '<a href="https://www.amazon.co.jp/dp/' + asin + '/ref=as_li_ss_il?&linkCode=li3" target="_blank">'
                + '<img border= "0" src= "//ws-fe.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=' + asin + '&Format=_SL250_&ID=AsinImage&MarketPlace=JP&ServiceVersion=20070822&WS=1" >'
                + '</a>'
                + '<img src= "https://ir-jp.amazon-adsystem.com/e/ir?l=li3&o=9&a=' + asin + '" width= "1" height= "1" border= "0" alt= "" style= "border:none !important; margin:0px !important;" />'

        }
        return html_str;
    }
    createAmazonLink(asin: string, element: any = null) {
        var html_str: string="";
        if (this.amazon_link_mode == "cover") {
            var text=this.getAmazonCover(asin);
            html_str='<div class="blogbib" id="amazon_' + asin + '">' + text+'</div>';
        } else {
            this.amazon_links[asin] = this.getAmazonLink(asin);
            html_str ='<div class="blogbib" id="amazon_' + asin + '"></div>';
        }
        

        if (element == null) {
            document.write(html_str);
        } else {
            element.append(html_str);
        }
    }

}
var blogbib = new BlogBib();
interface JQueryStatic {
    event: any;
}
$(window).ready(() => {
    console.log("[ready]")
    $.event.add(window, 'load', () => {
        console.log("[Init]")

        blogbib.load_amazon();
        blogbib.load_db();
    });
});

