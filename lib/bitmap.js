/**
 * @name bitmap-js
 * @author MrRafael-dev
 * @license MIT
 * @version 1.0.2b
 *
 * @description
 * Biblioteca de *bitmap* simples para *JavaScript*.
 *
 * Esta biblioteca permite importar/exportar *bitmaps* e oferece algumas
 * funcionalidades básicas de desenho.
 *
 * Apenas *bitmaps* descomprimido com uma paleta
 * de 256 cores (formato *8bpp*) são suportados.
 */
//#region <constants.ts>
/** Tamanho do cabeçalho (incluindo paleta). */
const HEADER_SIZE = 1078;
/** Número mágico ("BM"). */
const HEADER_BM = 0x424D;
/** (*Offset*) Número mágico ("BM"). */
const HEADER_MAGIC = 0;
/** (*Offset*) *Offset* dos ados da imagem. */
const HEADER_DATA = 10;
/** (*Offset*) Tamanho do arquivo, em *bytes*. */
const HEADER_FILESIZE = 2;
/** (*Offset*) Largura do *bitmap*, em *pixels*. */
const HEADER_WIDTH = 18;
/** (*Offset*) Altura do *bitmap*, em *pixels*. */
const HEADER_HEIGHT = 22;
/** (*Offset*) Formato de cores (*bits per pixel*). */
const HEADER_COLOR_FORMAT = 28;
/** (*Offset*) Formato de compressão. */
const HEADER_COMPRESSION = 30;
/** Número de cores da paleta. */
const PALETTE_SIZE = 256;
/** (*Offset*) Posição da paleta de cores. */
const PALETTE_START = 54;
/**
 * Cabeçalho padrão.
 *
 * Assume-se um *bitmap* descomprimido com
 * uma paleta de 256 cores (formato *8bpp*).
 */
const defaultHeader = new Uint8Array([
    0x42, 0x4d,
    0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
    0x36, 0x04, 0x00, 0x00,
    0x28, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
    0x01, 0x00,
    0x08, 0x00,
    0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
    0x12, 0x0b, 0x00, 0x00,
    0x12, 0x0b, 0x00, 0x00,
    0x00, 0x01, 0x00, 0x00,
    0x00, 0x01, 0x00, 0x00, // Número de cores importantes.
]);
//#endregion </constants.ts>
//#region <color.ts>
/**
 * @class Color
 *
 * @description
 * Representa uma cor no formato *RGBA*.
 */
export class Color {
    /** Canal de cor vermelho (*red*). */
    r;
    /** Canal de cor verde (*green*). */
    g;
    /** Canal de cor azul (*blue*). */
    b;
    /** Canal de transparência (*alpha*). */
    a;
    /**
     * Importa uma cor a partir de uma *string* hexadecimal.
     *
     * @param value *String* hexadecimal. (ex: `#9E42F5FF`)
     *
     * @returns {Color}
     */
    static fromHexString(value) {
        /** Resultado. */
        const result = new Color(0, 0, 0, 0);
        /** *Set* de caracteres válidos para uma *string* hexadecimal. */
        const charset = "0123456789abcdef";
        /** Bytes de cor. */
        let bytes = [0, 0, 0, 0, 0, 0, 0, 0];
        /** *String* hexadecimal, em letras minúsculas. */
        const lowerValue = value.toLowerCase();
        // Percorrer e coletar bytes...
        for (let index = 0; index < bytes.length; index += 1) {
            const char = lowerValue.charAt(index + 1);
            // Ignorar identificador "#"...
            if (index === 0 && char === "#") {
                continue;
            }
            const charIndex = charset.indexOf(char);
            bytes[index] = charIndex >= 0 ? charIndex : 0;
        }
        // Calcular e definir bytes de cor...
        result.r = (bytes[0] * 0x10) + bytes[1];
        result.g = (bytes[2] * 0x10) + bytes[3];
        result.b = (bytes[4] * 0x10) + bytes[5];
        result.a = (bytes[6] * 0x10) + bytes[7];
        return result;
    }
    /**
     *
     * @param r Canal de cor vermelho (*red*).
     * @param g Canal de cor verde (*green*).
     * @param b Canal de cor azul (*blue*).
     * @param a Canal de transparência (*alpha*).
     */
    constructor(r, g, b, a = 0) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    /**
     * Exporta esta cor para uma *string* hexadecimal.
     *
     * @returns {string}
     */
    toHexString() {
        const r = this.r.toString(16).padStart(2, "0");
        const g = this.g.toString(16).padStart(2, "0");
        const b = this.b.toString(16).padStart(2, "0");
        const a = this.a.toString(16).padStart(2, "0");
        return `#${r}${g}${b}${a}`;
    }
}
/**
 * @class MaskShader @implements PixelShader
 *
 * @description
 * *Pixel shader* usado para aplicar máscara de transparência.
 */
export class MaskShader {
    /** Máscara de transparência. */
    mask;
    /**
     * @constructor
     *
     * @param mask Máscara de transparência.
     */
    constructor(mask = -1) {
        this.mask = mask;
    }
    apply(x, y, previous, next) {
        // Descartar índice de cor da paleta quando este for igual ao definido
        // pela máscara de transparência...
        if (next === this.mask) {
            return -1;
        }
        return next;
    }
}
//#endregion </pixel_shader.ts>
//#region <bitmap.ts>
/**
 * @class Bitmap
 *
 * @description
 * Representa um *bitmap* descomprimido com
 * uma paleta de 256 cores (formato *8bpp*).
 */
export class Bitmap {
    /** Largura. */
    _width;
    /** Altura. */
    _height;
    /** Tamanho da área da imagem, em *pixels*. */
    _size;
    /** Dados da imagem. */
    _data;
    /**
     * Importa um *bitmap* a partir dos dados de um arquivo.
     *
     * @param file Arquivo.
     *
     * @returns {Bitmap}
     */
    static from(file) {
        // Esta biblioteca aceita apenas um formato muito específico de bitmap,
        // e este formato acontece de ter um cabeçalho de exatos 1078 bytes.
        if (file.byteLength < HEADER_SIZE) {
            throw new Error("Supported bitmaps must have at least 1078 bytes or more to be accepted.");
        }
        /** Visualizador de dados do arquivo. */
        const fileView = new DataView(file.buffer);
        /** (Número mágico ("BM"). */
        const signature = fileView.getUint16(HEADER_MAGIC, false);
        /** *Offset* dos ados da imagem. */
        const dataOffset = fileView.getUint32(HEADER_DATA, true);
        /** Largura do *bitmap*, em *pixels*. */
        const width = fileView.getUint32(HEADER_WIDTH, true);
        /** Altura do *bitmap*, em *pixels*. */
        const height = fileView.getUint32(HEADER_HEIGHT, true);
        /** Formato de cores (*bits per pixel*). */
        const bitsPerPixel = fileView.getUint16(HEADER_COLOR_FORMAT, true);
        /** Formato de compressão. */
        const compression = fileView.getUint16(HEADER_COMPRESSION, true);
        // Bitmaps são identificados pelo número mágico 0x424D ("BM").
        // Formatos inválidos serão rejeitados.
        if (signature !== HEADER_BM) {
            throw new Error("Invalid bitmap signature header. They must start with 0x424D (16973).");
        }
        // O formato de bitmap é tão específico que até o offset do início dos
        // dados de imagem precisam começar no lugar correto.
        if (dataOffset !== HEADER_SIZE) {
            throw new Error("Supported bitmaps must have their image data start exactly at offset 0x00000436 (1078).");
        }
        // Bitmaps devem ter um tamanho pelo menos de 1x1.
        // Tamanhos inválidos serão rejeitados.
        if (width <= 0 || height <= 0) {
            throw new Error("Invalid bitmap size. Width and height must be at least 1 pixel each.");
        }
        // Apenas o formato 8bpp é suportado.
        if (bitsPerPixel !== 8) {
            throw new Error("Supported bitmaps must use the 8bpp format.");
        }
        // Apenas bitmaps descomprimidos são suportados.
        if (compression !== 0) {
            throw new Error("Supported bitmaps must be uncompressed.");
        }
        /** *Bitmap* a ser retornado. */
        const result = new Bitmap(width, height);
        /** Dados de paleta e imagem do arquivo. */
        const fragment = file.slice(PALETTE_START, file.byteLength);
        result.data.set(fragment, PALETTE_START);
        return result;
    }
    /**
     * @constructor
     *
     * @param width Largura.
     * @param height Altura.
     * @param colors Cores.
     */
    constructor(width, height, colors = []) {
        // Bitmaps devem ter um tamanho pelo menos de 1x1.
        // Tamanhos inválidos serão rejeitados.
        if (width <= 0 || height <= 0) {
            throw new Error("Invalid bitmap size. Width and height must be at least 1 pixel each.");
        }
        this._width = width;
        this._height = height;
        this._size = this._width * this._height;
        this._data = new Uint8Array(HEADER_SIZE + this._size);
        /** Visualizador de dados da imagem. */
        const view = new DataView(this._data.buffer);
        // Inserir cabeçalho...
        this._data.set(defaultHeader, 0);
        // Escrever tamanho do arquivo e altura/largura da imagem...
        view.setUint32(HEADER_FILESIZE, this._data.byteLength, true);
        view.setUint32(HEADER_WIDTH, this.width, true);
        view.setUint32(HEADER_HEIGHT, this.height, true);
        // Inserir paleta de cores...
        this.setPalette(colors);
    }
    /** Largura. */
    get width() {
        return this._width;
    }
    /** Altura. */
    get height() {
        return this._height;
    }
    /** Tamanho da área da imagem, em *pixels*. */
    get size() {
        return this._size;
    }
    /** Dados da imagem. */
    get data() {
        return this._data;
    }
    /**
     * Exporta os dados da imagem para uma *array* de *bytes* no formato RGBA.
     * Este é o mesmo formato utilizado em elementos `<canvas>`.
     *
     * @param mask Máscara de transparência.
     *
     * @returns {Uint8Array}
     */
    toImageData(mask = -1) {
        /** Resultado a ser retornado. */
        const result = new Uint8Array(this._size * 4);
        // Percorrer pixels da imagem...
        for (let y = 0; y < this._height; y += 1) {
            for (let x = 0; x < this._width; x += 1) {
                /** *Pixel*. */
                const pixel = this.getPixel(x, y);
                // Ignorar máscara de transparência...
                if (pixel === mask) {
                    continue;
                }
                /** Cor da paleta equivalente ao *pixel* obtido. */
                const color = this.getColor(pixel);
                /** Índice a ser alterado no resultado. */
                const index = (this._width * y) + x;
                // Escrever cores...
                //
                // Alguns bitmaps não atribuem o valor de transparência 
                // corretamente, deixando-o como zero. Para evitar problemas,
                // este valor será sempre 0xFF (255), tornando o pixel sempre visível.
                result[index] = color.r;
                result[index + 1] = color.g;
                result[index + 2] = color.b;
                result[index + 3] = 0xFF;
            }
        }
        return result;
    }
    /**
     * Indica se uma determinada posição está dentro da área de desenho.
     *
     * @param x Posição X.
     * @param y Posição Y.
     *
     * @returns {boolean}
     */
    withinImage(x, y) {
        return x >= 0 && x < this._width && y >= 0 && y < this._height;
    }
    /**
     * Indica se um determinado índice de cor está dentro da paleta de cores.
     *
     * @param index Índice da paleta.
     *
     * @returns {boolean}
     */
    withinPalette(index) {
        return index >= 0 && index < PALETTE_SIZE;
    }
    /**
     * Define uma cor da paleta no índice especificado.
     *
     * @param index Índice da paleta.
     * @param color Cor.
     *
     * @returns {boolean}
     */
    setColor(index, color) {
        // O índice deve estar entre o tamanho da paleta.
        // Do contrário, nada será feito.
        if (!this.withinPalette(index)) {
            return false;
        }
        /** *Offset* da paleta. */
        const offset = PALETTE_START + (index * 4);
        // Escrever a nova cor...
        this._data[offset] = color.b;
        this._data[offset + 1] = color.g;
        this._data[offset + 2] = color.r;
        this._data[offset + 3] = color.a;
        return true;
    }
    /**
     * Obtém uma cópia da cor da paleta no índice especificado.
     * Retorna uma cor `#000000` quando não existe.
     *
     * @param index Índice da paleta.
     *
     * @returns {Color}
     */
    getColor(index) {
        // O índice deve estar entre o tamanho da paleta.
        // Do contrário, será retornada uma cor padrão.
        if (!this.withinPalette(index)) {
            return new Color(0, 0, 0, 0);
        }
        /** *Offset* da paleta. */
        const offset = PALETTE_START + (index * 4);
        return new Color(this._data[offset + 2], this._data[offset + 1], this._data[offset], this._data[offset + 3]);
    }
    /**
     * Define uma nova paleta de cores.
     *
     * @param colors Cores.
     *
     * @returns {boolean}
     */
    setPalette(colors) {
        /** Resultado final. */
        let result = true;
        for (let index = 0; index < colors.length; index += 1) {
            const color = colors[index];
            const colorResult = this.setColor(index, color);
            // Sinalizar resultado final, caso necessário...
            if (!colorResult) {
                result = false;
            }
            // Não exceder o tamanho da paleta...
            if (index >= PALETTE_SIZE) {
                break;
            }
        }
        return result;
    }
    /**
     * Obtém uma cópia da paleta de cores.
     *
     * @returns {Color[]}
     */
    getPalette() {
        /** Resultado. */
        const result = [];
        // Percorrer cores da paleta...
        for (let index = 0; index < PALETTE_SIZE; index += 1) {
            const color = this.getColor(index);
            result.push(color);
        }
        return result;
    }
    /**
     * Define um *pixel* na posição especificada.
     *
     * @param x Posição X.
     * @param y Posição Y.
     * @param primaryColor Cor da paleta (primária).
     *
     * @returns {boolean}
     */
    setPixel(x, y, primaryColor) {
        // A posição deve estar na área de desenho e
        // o índice deve estar entre o tamanho da paleta.
        // Do contrário, nada será feito.
        if (!this.withinImage(x, y) || !this.withinPalette(primaryColor)) {
            return false;
        }
        /** Posição Y, invertida. */
        const iy = (this._height - 1) - y;
        /** *Offset* do *pixel*. */
        const offset = HEADER_SIZE + (this._width * iy) + x;
        this._data[offset] = primaryColor;
        return true;
    }
    /**
     * Obtém um *pixel* na posição especificada.
     * Retorna a cor de paleta `-1` quando não existe.
     *
     * @param x Posição X.
     * @param y Posição Y.
     *
     * @returns {number}
     */
    getPixel(x, y) {
        // A posição deve estar na área de desenho.
        // Do contrário, será retornado uma cor de paleta negativa.
        if (!this.withinImage(x, y)) {
            return -1;
        }
        /** Posição Y, invertida. */
        const iy = (this._height - 1) - y;
        /** *Offset* do *pixel*. */
        const offset = HEADER_SIZE + (this._width * iy) + x;
        return this._data[offset];
    }
    /**
     * Retorna uma cópia da cor da paleta equivalente a um
     * *pixel* escolhido na posição especificada.
     * Retorna uma cor `#000000` quando não existe.
     *
     * @param x Posição X.
     * @param y Posição Y.
     *
     * @returns {Color}
     */
    getPixelColor(x, y) {
        const index = this.getPixel(x, y);
        const color = this.getColor(index);
        return color;
    }
    /**
     * Limpa todo o conteúdo da imagem.
     *
     * @param primaryColor Cor da paleta (primária).
     *
     * @returns {boolean}
     */
    clearImage(primaryColor) {
        this.data.fill(primaryColor, HEADER_SIZE);
        return true;
    }
}
//#endregion </bitmap.ts>
//#region <surface.ts>
/**
 * @class Surface
 *
 * @description
 * Representa uma camada de abstração para um *bitmap*.
 * Com uma *surace*, é possível realizar uma série de operações básicas
 * de desenho, como linhas, retângulos e outros *bitmaps*.
 */
export class Surface extends Bitmap {
    /**
     * @constructor
     *
     * @param width Largura.
     * @param height Altura.
     * @param colors Cores.
     */
    constructor(width, height, colors = []) {
        super(width, height, colors);
    }
    /**
     * Define um *pixel* na posição especificada.
     *
     * @param x Posição X.
     * @param y Posição Y.
     * @param primaryColor Cor da paleta (primária).
     * @param shaders *Pixel shaders*.
     *
     * @returns {this}
     */
    pixel(x, y, primaryColor, shaders = []) {
        /** *Pixel* original. */
        let previous = this.getPixel(x, y);
        /** Novo *pixel*. */
        let next = primaryColor;
        // Aplicar pixel shaders...
        for (let index = 0; index < shaders.length; index += 1) {
            const shader = shaders[index];
            const result = shader.apply(x, y, previous, next);
            // Avançar sequência de pixels...
            previous = next;
            next = result;
        }
        this.setPixel(x, y, next);
        return this;
    }
    /**
     * Limpa todo o conteúdo da imagem.
     *
     * @param primaryColor Cor da paleta (primária).
     *
     * @returns {this}
     */
    clear(primaryColor) {
        this.clearImage(primaryColor);
        return this;
    }
    /**
     * Desenha uma linha (horizontal).
     *
     * @param x Posição X.
     * @param y Posição Y.
     * @param size Tamanho.
     * @param primaryColor Cor da paleta (primária).
     * @param shaders *Pixel shaders*.
     *
     * @returns {this}
     */
    hline(x, y, size, primaryColor, shaders = []) {
        // Desenhar pixels...
        for (let index = 0; index < size; index += 1) {
            this.pixel(x + index, y, primaryColor, shaders);
        }
        return this;
    }
    /**
     * Desenha uma linha (vertical).
     *
     * @param x Posição X.
     * @param y Posição Y.
     * @param size Tamanho.
     * @param primaryColor Cor da paleta (primária).
     * @param shaders *Pixel shaders*.
     *
     * @returns {this}
     */
    vline(x, y, size, primaryColor, shaders = []) {
        // Desenhar pixels...
        for (let index = 0; index < size; index += 1) {
            this.pixel(x, y + index, primaryColor, shaders);
        }
        return this;
    }
    /**
     * Desenha um retângulo (bordas).
     *
     * @param x Posição X.
     * @param y Posição Y.
     * @param width Largura.
     * @param height Altura.
     * @param primaryColor Cor da paleta (primária).
     * @param shaders *Pixel shaders*.
     *
     * @returns {this}
     */
    rectb(x, y, width, height, primaryColor, shaders = []) {
        this.hline(x, y, width, primaryColor);
        this.hline(x, y + height, width, primaryColor);
        this.vline(x, y + 1, height - 1, primaryColor);
        this.vline(x + width - 1, y + 1, height - 1, primaryColor);
        return this;
    }
    /**
     * Desenha um retângulo (preenchido).
     *
     * @param x Posição X.
     * @param y Posição Y.
     * @param width Largura.
     * @param height Altura.
     * @param primaryColor Cor da paleta (primária).
     * @param shaders *Pixel shaders*.
     *
     * @returns {this}
     */
    rectf(x, y, width, height, primaryColor, shaders = []) {
        // Desenhar linhas...
        for (let index = 0; index < height; index += 1) {
            this.hline(x, y + index, width, primaryColor);
        }
        return this;
    }
    /**
     * Desenha um retângulo.
     *
     * @param x Posição X.
     * @param y Posição Y.
     * @param width Largura.
     * @param height Altura.
     * @param primaryColor Cor da paleta (primária). Usada para as bordas.
     * @param secondaryColor Cor da paleta (secundária). Usada para o preenchimento.
     * @param shaders *Pixel shaders*.
     *
     * @returns {this}
     */
    rect(x, y, width, height, primaryColor, secondaryColor, shaders = []) {
        this.rectb(x, y, width, height, primaryColor, shaders);
        this.rectf(x + 1, y + 1, width - 1, height - 1, secondaryColor, shaders);
        return this;
    }
    /**
     * Desenha um *bitmap* (recortado).
     *
     * @param bitmap *Bitmap*.
     * @param x Posição X.
     * @param y Posição Y.
     * @param cx Posição X de recorte.
     * @param cy Posição Y de recorte.
     * @param width Largura.
     * @param height Altura.
     * @param scaleX Escala/inverte a imagem horizontalmente. Os valores são convertidos para inteiros.
     * @param scaleY Escala/inverte a imagem verticalmente. Os valores são convertidos para inteiros.
     * @param rotation Rotaciona a imagem. Os valores são convertidos para múltiplos de 90º.
     * @param shaders *Pixel shaders*.
     *
     * @returns {this}
     */
    blitsub(bitmap, x, y, cx, cy, width, height, scaleX = 1, scaleY = 1, rotation = 0, shaders = []) {
        // A escala precisa ser um valor diferente de zero para funcionar.
        // Do contrário, a operação será encerrada.
        if (scaleX === 0 || scaleY === 0) {
            return this;
        }
        /** Inverter horizontalmente. */
        const mirrored = scaleX < 0 ? true : false;
        /** Inverter verticalmente. */
        const flipped = scaleY < 0 ? true : false;
        /** *Offset* horizontal do *pixel*. */
        const fx = mirrored ?
            Math.floor(scaleX)
            : Math.ceil(scaleX);
        /** *Offset* vertical do *pixel*. */
        const fy = flipped ?
            Math.floor(scaleY)
            : Math.ceil(scaleY);
        /** Ângulo de rotação, representado em múltiplos de 90º. */
        const angle = rotation < 0 ?
            (Math.ceil(rotation) / 90)
            : (Math.floor(rotation) / 90);
        /** Largura do *pixel*. */
        const pw = Math.abs(fx);
        /** Altura do *pixel*. */
        const ph = Math.abs(fy);
        // Dependendo da escala vertical, a coluna será redesenhada
        // várias veze sob offsets diferentes...
        for (let pxy = 0; pxy < ph; pxy += 1) {
            // Percorrer linhas da imagem...
            for (let dy = 0; dy < height; dy += 1) {
                // Dependendo da escala horizontal, a linha será redesenhada 
                // várias vezes sob offsets diferentes...
                for (let pxi = 0; pxi < pw; pxi += 1) {
                    // Percorrer colunas da imagem...
                    for (let dx = 0; dx < width; dx += 1) {
                        const pixel = bitmap.getPixel(dx + cx, dy + cy);
                        /** Posição X calculada do *pixel*. */
                        const px = mirrored ?
                            (width - 1) - (x + dx)
                            : x + dx;
                        /** Posição Y calculada do *pixel*. */
                        const py = flipped ?
                            (height - 1) - (y + dy)
                            : y + dy;
                        // Desenhar pixel...
                        this.pixel(px + ((pw - 1) * dx) + pxi, py + ((ph - 1) * dy) + pxy, pixel, shaders);
                    }
                }
            }
        }
        return this;
    }
    /**
     * Desenha um *bitmap* (completo).
     *
     * @param bitmap *Bitmap*.
     * @param x Posição X.
     * @param y Posição Y.
     * @param scaleX Escala/inverte a imagem horizontalmente. Os valores são convertidos para inteiros.
     * @param scaleY Escala/inverte a imagem verticalmente. Os valores são convertidos para inteiros.
     * @param rotation Rotaciona a imagem. Os valores são convertidos para múltiplos de 90º.
     * @param shaders *Pixel shaders*.
     *
     * @returns {this}
     */
    blit(bitmap, x, y, scaleX = 1, scaleY = 1, rotation = 0, shaders = []) {
        this.blitsub(bitmap, x, y, 0, 0, bitmap.width, bitmap.height, scaleX, scaleY, rotation, shaders);
        return this;
    }
    /**
     * Escreve um texto, utilizando um *bitmap* como fonte.
     *
     * @param bitmap *Bitmap*.
     * @param x Posição X.
     * @param y Posição Y.
     * @param cx Posição X de recorte.
     * @param cy Posição Y de recorte.
     * @param width Largura.
     * @param height Altura.
     * @param charset *Set* de caracteres da fonte.
     * @param charColumns Número de caracteres por coluna.
     * @param text Texto a ser escrito.
     * @param letterSpacing Espaçamento horizontal entre caracteres.
     * @param lineHeight Espaçamento vertical entre linhas.
     * @param scaleX Escala/inverte a imagem horizontalmente. Os valores são convertidos para inteiros.
     * @param scaleY Escala/inverte a imagem verticalmente. Os valores são convertidos para inteiros.
     * @param rotation Rotaciona a imagem. Os valores são convertidos para múltiplos de 90º.
     * @param shaders *Pixel shaders*.
     *
     * @returns {this}
     */
    text(bitmap, x, y, cx, cy, width, height, charset, charColumns, text, letterSpacing = 0, lineHeight = 0, scaleX = 1, scaleY = 1, rotation = 0, shaders = []) {
        // Posições do texto.
        let line = 0;
        let column = 0;
        // Percorrer caracteres do texto...
        for (let index = 0; index < text.length; index += 1) {
            const char = text.charAt(index);
            const charIndex = charset.indexOf(char);
            // Quebrar linhas...
            if (char === "\n") {
                line += 1;
                column = 0;
                continue;
            }
            // Ignorar espaços e/ou caracteres que não existirem no charset...
            if (charIndex < 0) {
                column += 1;
                continue;
            }
            // Obter posição do caractere na imagem...
            const charRow = Math.floor(charIndex / charColumns) % charColumns;
            const charColumn = charIndex % charColumns;
            // Calcular valores de recorte...
            const charX = x + (column * width) + (letterSpacing * column);
            const charY = y + (line * height) + (lineHeight * line);
            const charCutX = cx + (charColumn * width);
            const charCutY = cy + (charRow * height);
            // Desenhar caractere...
            this.blitsub(bitmap, charX, charY, charCutX, charCutY, width, height, scaleX, scaleY, rotation, shaders);
            // Avançar para a próxima coluna...
            column += 1;
        }
        return this;
    }
}
//#endregion </surface.ts>
//# sourceMappingURL=bitmap.js.map