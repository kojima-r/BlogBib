/// <reference path="scripts/typings/jquery/jquery.d.ts" />

class BlogBib {
    endpoint: string;

    constructor(element: HTMLElement) {
        this.endpoint = "http://api.openbd.jp/v1/";
    }

    start() {
        

        //this.timerToken = setInterval(() => this.span.innerHTML = new Date().toUTCString(), 500);
    }
    call(args) {
        $.ajax({
            type: "POST",
            url: this.endpoint+"/get",
            data:  args,
            success: function (msg) {
                alert(msg["msg"]);
            },
            error: function (req, sts, err) {
                alert("Error! sts=" + sts);
            }
        });
    }
    stop() {
    }

}

window.onload = () => {
    var app = new BlogBib(null);
    console.log("test");
    //app.call("isbn=4103503610");
};