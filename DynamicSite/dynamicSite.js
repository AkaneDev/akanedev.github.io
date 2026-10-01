/*
 * DynamicSite shared encoder / decoder
 *
 * DS1:
 *   UTF-8 -> Base64URL
 *
 * DS2:
 *   UTF-8 -> 14-bit Unicode encoding
 *
 * DS2 uses characters from:
 *
 *   U+4E00 .. U+8FFF
 *
 * giving us exactly 16,384 symbols.
 *
 * That's exactly 14 bits per Unicode character.
 */

const DYNAMICSITE_VERSION = "DS2";


/*
 * --------------------------------------------------------------------------
 * DS1
 * --------------------------------------------------------------------------
 */

function encodeDS1(html) {
    const bytes = new TextEncoder().encode(html);

    let binary = "";

    const CHUNK_SIZE = 0x8000;

    for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
        const chunk = bytes.subarray(
            i,
            Math.min(i + CHUNK_SIZE, bytes.length)
        );

        binary += String.fromCharCode(...chunk);
    }

    const base64 = btoa(binary);

    const base64url = base64
        .replaceAll("+", "-")
        .replaceAll("/", "_")
        .replaceAll("=", "");

    return `DS1:${base64url}`;
}


function decodeDS1(payload) {
    if (!payload.startsWith("DS1:")) {
        throw new Error("Not a DS1 payload");
    }

    const encoded = payload.slice(4);

    const base64 = encoded
        .replaceAll("-", "+")
        .replaceAll("_", "/")
        .padEnd(
            Math.ceil(encoded.length / 4) * 4,
            "="
        );

    const binary = atob(base64);

    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    return new TextDecoder(
        "utf-8",
        { fatal: true }
    ).decode(bytes);
}


/*
 * --------------------------------------------------------------------------
 * DS2 Unicode encoding
 * --------------------------------------------------------------------------
 *
 * We use 14 bits per Unicode symbol.
 *
 * 2^14 = 16,384 symbols.
 *
 * Alphabet:
 *
 *   U+4E00 .. U+8FFF
 *
 * The first symbol stores the number of padding bits.
 */

const DS2_ALPHABET_START = 0x4E00;
const DS2_ALPHABET_SIZE = 0x4000; // 16,384 symbols
const DS2_BITS = 14;
const DS2_MASK = (1 << DS2_BITS) - 1;


/*
 * Convert UTF-8 bytes into a stream of 14-bit values.
 *
 * The first Unicode symbol stores the number of padding bits.
 */
function encodeDS2(html) {
    const bytes = new TextEncoder().encode(html);

    let accumulator = 0;
    let bits = 0;

    const values = [];

    for (const byte of bytes) {
        accumulator =
            (accumulator << 8) |
            byte;

        bits += 8;

        while (bits >= DS2_BITS) {
            bits -= DS2_BITS;

            const value =
                (accumulator >> bits) & DS2_MASK;

            values.push(value);

            /*
             * Keep only the remaining bits.
             */
            accumulator &=
                bits === 0
                    ? 0
                    : (1 << bits) - 1;
        }
    }

    /*
     * Pad the final symbol.
     */
    let paddingBits = 0;

    if (bits > 0) {
        paddingBits = DS2_BITS - bits;

        values.push(
            (accumulator << paddingBits) & DS2_MASK
        );
    }

    /*
     * First symbol stores padding count.
     */
    values.unshift(paddingBits);

    /*
     * Convert values to Unicode characters.
     */
    let output = "";

    for (const value of values) {
        output += String.fromCodePoint(
            DS2_ALPHABET_START + value
        );
    }

    return `DS2:${output}`;
}


function decodeDS2(payload) {
    if (!payload.startsWith("DS2:")) {
        throw new Error("Not a DS2 payload");
    }

    const encoded = payload.slice(4);

    if (encoded.length === 0) {
        throw new Error("Empty DS2 payload");
    }

    /*
     * Convert Unicode characters back into 14-bit values.
     */
    const values = new Uint16Array(encoded.length);

    for (let i = 0; i < encoded.length; i++) {
        const codePoint =
            encoded.codePointAt(i);

        const value =
            codePoint - DS2_ALPHABET_START;

        if (
            value < 0 ||
            value >= DS2_ALPHABET_SIZE
        ) {
            throw new Error(
                `Invalid DS2 character: U+${codePoint
                    .toString(16)
                    .toUpperCase()
                    .padStart(4, "0")}`
            );
        }

        values[i] = value;
    }

    /*
     * First value is the padding count.
     */
    const paddingBits = values[0];

    if (paddingBits > 13) {
        throw new Error("Invalid DS2 padding");
    }

    /*
     * There must be at least one data symbol.
     */
    if (values.length === 1) {
        if (paddingBits !== 0) {
            throw new Error(
                "Invalid DS2 payload"
            );
        }

        return "";
    }

    /*
     * Total number of encoded data bits.
     *
     * Every data symbol contributes 14 bits.
     * The final symbol contains paddingBits unused bits.
     */
    const totalBits =
        ((values.length - 1) * DS2_BITS) -
        paddingBits;

    if (totalBits < 0 || totalBits % 8 !== 0) {
        throw new Error(
            "Invalid DS2 bit length"
        );
    }

    const expectedByteLength =
        totalBits / 8;

    const bytes = new Uint8Array(
        expectedByteLength
    );

    /*
     * Reconstruct the bitstream.
     *
     * We deliberately process exactly totalBits.
     * Padding is therefore never interpreted as data.
     */
    let accumulator = 0;
    let bits = 0;
    let byteIndex = 0;

    for (let i = 1; i < values.length; i++) {
        let value = values[i];
        let valueBits = DS2_BITS;

        /*
         * The final symbol contains padding at its
         * least-significant end.
         */
        if (i === values.length - 1 && paddingBits > 0) {
            value >>= paddingBits;
            valueBits -= paddingBits;
        }

        accumulator =
            (accumulator << valueBits) |
            value;

        bits += valueBits;

        while (bits >= 8) {
            bits -= 8;

            bytes[byteIndex++] =
                (accumulator >> bits) & 0xFF;

            accumulator =
                bits === 0
                    ? 0
                    : accumulator & ((1 << bits) - 1);
        }
    }

    if (byteIndex !== bytes.length) {
        throw new Error(
            "Invalid DS2 byte length"
        );
    }

    /*
     * Validate UTF-8.
     */
    try {
        return new TextDecoder(
            "utf-8",
            { fatal: true }
        ).decode(bytes);
    } catch {
        throw new Error(
            "DS2 payload contains invalid UTF-8"
        );
    }
}


/*
 * --------------------------------------------------------------------------
 * Generic DynamicSite API
 * --------------------------------------------------------------------------
 */

function encodeDynamicSite(html) {
    return encodeDS2(html);
}


function decodeDynamicSite(payload) {
    if (payload.startsWith("DS1:")) {
        return decodeDS1(payload);
    }

    if (payload.startsWith("DS2:")) {
        return decodeDS2(payload);
    }

    throw new Error(
        "Unknown DynamicSite format. Expected DS1 or DS2."
    );
}


/*
 * --------------------------------------------------------------------------
 * DynamicSite URL handling
 * --------------------------------------------------------------------------
 *
 * The payload is stored in the URL fragment:
 *
 *   index.html#DS2:...
 *
 * Fragments are handled entirely by the browser and are NOT
 * included in the HTTP request to the server.
 *
 * This means a huge DynamicSite payload will not cause the
 * web server to reject the request with a 431 error.
 */

function createDynamicSiteURL(html) {
    const payload =
        encodeDynamicSite(html);

    const url = new URL(
        "index.html",
        window.location.href
    );

    /*
     * Remove any existing query parameters.
     */
    url.search = "";

    /*
     * Put the DynamicSite payload in the fragment.
     *
     * URL will handle the required escaping when serialised.
     */
    url.hash = payload;

    return url.toString();
}


function getDynamicSitePayload() {
    const hash = window.location.hash;

    if (!hash || hash.length <= 1) {
        return null;
    }

    /*
     * Remove '#'.
     */
    return decodeURIComponent(
        hash.slice(1)
    );
}


/*
 * --------------------------------------------------------------------------
 * Debug helpers
 * --------------------------------------------------------------------------
 */

function getDynamicSiteStats(html) {
    const ds1 = encodeDS1(html);
    const ds2 = encodeDS2(html);

    const ds1Encoded =
        encodeURIComponent(ds1);

    const ds2Encoded =
        encodeURIComponent(ds2);

    return {
        originalCharacters:
            html.length,

        originalBytes:
            new TextEncoder()
                .encode(html)
                .length,

        ds1Characters:
            ds1.length,

        ds2Characters:
            ds2.length,

        /*
         * Approximate URL-encoded payload sizes.
         *
         * These are useful for comparing query-string
         * behaviour, even though DynamicSite now uses
         * the fragment.
         */
        ds1URLBytes:
            new TextEncoder()
                .encode(ds1Encoded)
                .length,

        ds2URLBytes:
            new TextEncoder()
                .encode(ds2Encoded)
                .length
    };
}