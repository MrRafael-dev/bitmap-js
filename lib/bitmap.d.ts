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
/**
 * @class Color
 *
 * @description
 * Representa uma cor no formato *RGBA*.
 */
export declare class Color {
    /** Canal de cor vermelho (*red*). */
    r: number;
    /** Canal de cor verde (*green*). */
    g: number;
    /** Canal de cor azul (*blue*). */
    b: number;
    /** Canal de transparência (*alpha*). */
    a: number;
    /**
     * Importa uma cor a partir de uma *string* hexadecimal.
     *
     * @param value *String* hexadecimal. (ex: `#9E42F5FF`)
     *
     * @returns {Color}
     */
    static fromHexString(value: string): Color;
    /**
     *
     * @param r Canal de cor vermelho (*red*).
     * @param g Canal de cor verde (*green*).
     * @param b Canal de cor azul (*blue*).
     * @param a Canal de transparência (*alpha*).
     */
    constructor(r: number, g: number, b: number, a?: number);
    /**
     * Exporta esta cor para uma *string* hexadecimal.
     *
     * @returns {string}
     */
    toHexString(): string;
}
/**
 * @interface PixelShader
 *
 * @description
 * Estrutura representativa de um *pixel shader*.
 *
 * *Pixel shaders* pré-processam a cor da paleta equivalente de um determinado
 * *pixel*, permitindo modificá-la de acordo com sua posição e/ou índice.
 *
 * Isto pode ser utilizado para máscaras de transparência ou efeitos especiais.
 */
export interface PixelShader {
    /**
     * Aplica um efeito de *shader* sob um *pixel*.
     *
     * @param x Posição X.
     * @param y Posição Y.
     * @param previous *Pixel* original.
     * @param next Novo *pixel*.
     *
     * @returns {number}
     */
    apply(x: number, y: number, previous: number, next: number): number;
}
/**
 * @class MaskShader @implements PixelShader
 *
 * @description
 * *Pixel shader* usado para aplicar máscara de transparência.
 */
export declare class MaskShader implements PixelShader {
    /** Máscara de transparência. */
    mask: number;
    /**
     * @constructor
     *
     * @param mask Máscara de transparência.
     */
    constructor(mask?: number);
    apply(x: number, y: number, previous: number, next: number): number;
}
/**
 * @class Bitmap
 *
 * @description
 * Representa um *bitmap* descomprimido com
 * uma paleta de 256 cores (formato *8bpp*).
 */
export declare class Bitmap {
    /** Largura. */
    private _width;
    /** Altura. */
    private _height;
    /** Tamanho da área da imagem, em *pixels*. */
    private _size;
    /** Dados da imagem. */
    private _data;
    /**
     * Importa um *bitmap* a partir dos dados de um arquivo.
     *
     * @param file Arquivo.
     *
     * @returns {Bitmap}
     */
    static from(file: Uint8Array): Bitmap;
    /**
     * @constructor
     *
     * @param width Largura.
     * @param height Altura.
     * @param colors Cores.
     */
    constructor(width: number, height: number, colors?: Color[]);
    /** Largura. */
    get width(): number;
    /** Altura. */
    get height(): number;
    /** Tamanho da área da imagem, em *pixels*. */
    get size(): number;
    /** Dados da imagem. */
    get data(): Uint8Array;
    /**
     * Exporta os dados da imagem para uma *array* de *bytes* no formato RGBA.
     * Este é o mesmo formato utilizado em elementos `<canvas>`.
     *
     * @param mask Máscara de transparência.
     *
     * @returns {Uint8Array}
     */
    toImageData(mask?: number): Uint8Array;
    /**
     * Indica se uma determinada posição está dentro da área de desenho.
     *
     * @param x Posição X.
     * @param y Posição Y.
     *
     * @returns {boolean}
     */
    withinImage(x: number, y: number): boolean;
    /**
     * Indica se um determinado índice de cor está dentro da paleta de cores.
     *
     * @param index Índice da paleta.
     *
     * @returns {boolean}
     */
    withinPalette(index: number): boolean;
    /**
     * Define uma cor da paleta no índice especificado.
     *
     * @param index Índice da paleta.
     * @param color Cor.
     *
     * @returns {boolean}
     */
    setColor(index: number, color: Color): boolean;
    /**
     * Obtém uma cópia da cor da paleta no índice especificado.
     * Retorna uma cor `#000000` quando não existe.
     *
     * @param index Índice da paleta.
     *
     * @returns {Color}
     */
    getColor(index: number): Color;
    /**
     * Define uma nova paleta de cores.
     *
     * @param colors Cores.
     *
     * @returns {boolean}
     */
    setPalette(colors: Color[]): boolean;
    /**
     * Obtém uma cópia da paleta de cores.
     *
     * @returns {Color[]}
     */
    getPalette(): Color[];
    /**
     * Define um *pixel* na posição especificada.
     *
     * @param x Posição X.
     * @param y Posição Y.
     * @param primaryColor Cor da paleta (primária).
     *
     * @returns {boolean}
     */
    setPixel(x: number, y: number, primaryColor: number): boolean;
    /**
     * Obtém um *pixel* na posição especificada.
     * Retorna a cor de paleta `-1` quando não existe.
     *
     * @param x Posição X.
     * @param y Posição Y.
     *
     * @returns {number}
     */
    getPixel(x: number, y: number): number;
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
    getPixelColor(x: number, y: number): Color;
    /**
     * Limpa todo o conteúdo da imagem.
     *
     * @param primaryColor Cor da paleta (primária).
     *
     * @returns {boolean}
     */
    clearImage(primaryColor: number): boolean;
}
/**
 * @class Surface
 *
 * @description
 * Representa uma camada de abstração para um *bitmap*.
 * Com uma *surace*, é possível realizar uma série de operações básicas
 * de desenho, como linhas, retângulos e outros *bitmaps*.
 */
export declare class Surface extends Bitmap {
    /**
     * @constructor
     *
     * @param width Largura.
     * @param height Altura.
     * @param colors Cores.
     */
    constructor(width: number, height: number, colors?: Color[]);
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
    pixel(x: number, y: number, primaryColor: number, shaders?: PixelShader[]): this;
    /**
     * Limpa todo o conteúdo da imagem.
     *
     * @param primaryColor Cor da paleta (primária).
     *
     * @returns {this}
     */
    clear(primaryColor: number): this;
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
    hline(x: number, y: number, size: number, primaryColor: number, shaders?: PixelShader[]): this;
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
    vline(x: number, y: number, size: number, primaryColor: number, shaders?: PixelShader[]): this;
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
    rectb(x: number, y: number, width: number, height: number, primaryColor: number, shaders?: PixelShader[]): this;
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
    rectf(x: number, y: number, width: number, height: number, primaryColor: number, shaders?: PixelShader[]): this;
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
    rect(x: number, y: number, width: number, height: number, primaryColor: number, secondaryColor: number, shaders?: PixelShader[]): this;
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
    blitsub(bitmap: Bitmap, x: number, y: number, cx: number, cy: number, width: number, height: number, scaleX?: number, scaleY?: number, rotation?: number, shaders?: PixelShader[]): this;
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
    blit(bitmap: Bitmap, x: number, y: number, scaleX?: number, scaleY?: number, rotation?: number, shaders?: PixelShader[]): this;
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
    text(bitmap: Bitmap, x: number, y: number, cx: number, cy: number, width: number, height: number, charset: string, charColumns: number, text: string, letterSpacing?: number, lineHeight?: number, scaleX?: number, scaleY?: number, rotation?: number, shaders?: PixelShader[]): this;
}