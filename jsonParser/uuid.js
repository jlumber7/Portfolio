var SHA1Generator = {
    hex_chr: "0123456789abcdef",

    hex: function (num) {
        var str = "";
        for (var j = 7; j >= 0; j--)
            str += this.hex_chr.charAt((num >> (j * 4)) & 0x0F);
        return str;
    },

    str2blks_SHA1: function (str) {
        var nblk = ((str.length + 8) >> 6) + 1;
        var blks = new Array(nblk * 16);
        for (var i = 0; i < nblk * 16; i++) blks[i] = 0;
        for (var i = 0; i < str.length; i++)
            blks[i >> 2] |= str.charCodeAt(i) << (24 - (i % 4) * 8);
        blks[i >> 2] |= 0x80 << (24 - (i % 4) * 8);
        blks[nblk * 16 - 1] = str.length * 8;
        return blks;
    },

    add: function (x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    },

    rol: function (num, cnt) {
        return (num << cnt) | (num >>> (32 - cnt));
    },

    ft: function (t, b, c, d) {
        if (t < 20) return (b & c) | ((~b) & d);
        if (t < 40) return b ^ c ^ d;
        if (t < 60) return (b & c) | (b & d) | (c & d);
        return b ^ c ^ d;
    },

    kt: function (t) {
        return (t < 20) ? 1518500249 : (t < 40) ? 1859775393 :
            (t < 60) ? -1894007588 : -899497514;
    },

    calcSHA1FromByte: function (byteArr) {
        var str = '';
        for (var i = 0; i < byteArr.length; i++)
            str += String.fromCharCode(byteArr[i]);
        return this.calcSHA1(str);
    },

    calcSHA1: function (str) {
        if (str != '') {
            var x = this.str2blks_SHA1(str);
            var w = new Array(80).fill(0);

            var a = 1732584193;
            var b = -271733879;
            var c = -1732584194;
            var d = 271733878;
            var e = -1009589776;

            var t; // Declare t here

            for (var i = 0; i < x.length; i += 16) {
                var olda = a;
                var oldb = b;
                var oldc = c;
                var oldd = d;
                var olde = e;

                for (var j = 0; j < 80; j++) {
                    if (j < 16) w[j] = x[i + j];
                    else w[j] = this.rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
                    t = this.add(this.add(this.rol(a, 5), this.ft(j, b, c, d)), this.add(this.add(e, w[j]), this.kt(j)));
                    e = d;
                    d = c;
                    c = this.rol(b, 30);
                    b = a;
                    a = t;
                }

                a = this.add(a, olda);
                b = this.add(b, oldb);
                c = this.add(c, oldc);
                d = this.add(d, oldd);
                e = this.add(e, olde);
            }
            return this.hex(a) + this.hex(b) + this.hex(c) + this.hex(d) + this.hex(e);
        }
        else {
            return '';
        }
    }
};

function stringToByteArray(str) {
    var bytes = [];
    for (var i = 0; i < str.length; ++i) {
        bytes.push(str.charCodeAt(i));
    }
    return bytes;
}

function uuidToByteArray(hex) {
    hex = hex.replace(/-/g, "");
    var bytes = [];
    for (var i = 0; i < hex.length; i += 2) {
        bytes.push(parseInt(hex.substring(i, i + 2), 16));
    }
    return bytes;
}

function sha1ToUUID5(hash) {
    var uuid = hash.substring(0, 8) +
        '-' + hash.substring(8, 12) +
        '-' + ((parseInt(hash.substring(12, 16), 16) & 0x0fff) | 0x5000).toString(16) +
        '-' + ((parseInt(hash.substring(16, 20), 16) & 0x3fff) | 0x8000).toString(16) +
        '-' + hash.substring(20, 32);
    return uuid;
}

const NAMESPACE_UUID = '12345678-1234-5678-1234-567812345678';

function generateUUID5(name) {
    var namespaceBytes = uuidToByteArray(NAMESPACE_UUID);
    var idBytes = stringToByteArray(name);
    var allBytes = namespaceBytes.concat(idBytes);
    return sha1ToUUID5(SHA1Generator.calcSHA1FromByte(allBytes));
}

//const uuid = generateUUID1('root', 'server1');