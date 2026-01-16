// sha1.js - Implementació autònoma i fiable de SHA-1
(function (global) {
    'use strict';
    function Sha1() {
        this.init();
    }
    Sha1.prototype.init = function () {
        this.blocks = [];
        this.h0 = 0x67452301;
        this.h1 = 0xEFCDAB89;
        this.h2 = 0x98BADCFE;
        this.h3 = 0x10325476;
        this.h4 = 0xC3D2E1F0;
        this.total = 0;
        this.buffer = '';
    };
    Sha1.prototype.update = function (data) {
        this.buffer += data;
        var i, block;
        while (this.buffer.length >= 64) {
            block = this.buffer.substring(0, 64);
            this.buffer = this.buffer.substring(64);
            this.blocks.push(block);
            this.total += block.length;
        }
    };
    Sha1.prototype.finalize = function () {
        var i, block, bits;
        this.buffer += '\x80';
        while (this.buffer.length % 64 !== 56) {
            this.buffer += '\x00';
        }
        bits = this.total * 8;
        for (i = 0; i < 8; i++) {
            this.buffer += String.fromCharCode((bits >>> (56 - i * 8)) & 0xff);
        }
        block = this.buffer;
        this.buffer = '';
        this.blocks.push(block);
        this.total += block.length;
    };
    Sha1.prototype.hash = function () {
        var i, j, block, words = [], a, b, c, d, e, temp, w = [];
        this.finalize();
        for (i = 0; i < this.blocks.length; i++) {
            block = this.blocks[i];
            for (j = 0; j < 64; j += 4) {
                words[j / 4] = ((block.charCodeAt(j) & 0xff) << 24) |
                    ((block.charCodeAt(j + 1) & 0xff) << 16) |
                    ((block.charCodeAt(j + 2) & 0xff) << 8) |
                    (block.charCodeAt(j + 3) & 0xff);
            }
            for (j = 16; j < 80; j++) {
                w[j] = Sha1.rol(words[j - 3] ^ words[j - 8] ^ words[j - 14] ^ words[j - 16], 1);
                words[j] = w[j];
            }
            a = this.h0; b = this.h1; c = this.h2; d = this.h3; e = this.h4;
            for (j = 0; j < 80; j++) {
                if (j < 20) {
                    temp = Sha1.rol(a, 5) + Sha1.f1(b, c, d) + e + w[j] + 0x5a827999;
                } else if (j < 40) {
                    temp = Sha1.rol(a, 5) + Sha1.f2(b, c, d) + e + w[j] + 0x6ed9eba1;
                } else if (j < 60) {
                    temp = Sha1.rol(a, 5) + Sha1.f3(b, c, d) + e + w[j] + 0x8f1bbcdc;
                } else {
                    temp = Sha1.rol(a, 5) + Sha1.f2(b, c, d) + e + w[j] + 0xca62c1d6;
                }
                e = d; d = c; c = Sha1.rol(b, 30); b = a; a = temp & 0xffffffff;
            }
            this.h0 = (this.h0 + a) & 0xffffffff;
            this.h1 = (this.h1 + b) & 0xffffffff;
            this.h2 = (this.h2 + c) & 0xffffffff;
            this.h3 = (this.h3 + d) & 0xffffffff;
            this.h4 = (this.h4 + e) & 0xffffffff;
        }
        return Sha1.toHex(this.h0) + Sha1.toHex(this.h1) + Sha1.toHex(this.h2) +
            Sha1.toHex(this.h3) + Sha1.toHex(this.h4);
    };
    Sha1.rol = function (num, cnt) {
        return (num << cnt) | (num >>> (32 - cnt));
    };
    Sha1.f1 = function (x, y, z) { return (x & y) | (~x & z); };
    Sha1.f2 = function (x, y, z) { return x ^ y ^ z; };
    Sha1.f3 = function (x, y, z) { return (x & y) | (x & z) | (y & z); };
    Sha1.toHex = function (num) {
        var s = '', v;
        for (var i = 7; i >= 0; i--) {
            v = (num >>> (i * 4)) & 0x0f;
            s += v.toString(16);
        }
        return s;
    };
    global.sha1 = function (data) {
        var s = new Sha1();
        s.update(data);
        return s.hash();
    };
}(this));
