/**
 * @name bitmap-js
 * @author MrRafael-dev
 * @license MIT
 * @version 0.0.1
 *
 * @description
 * Biblioteca de bitmap simples para JavaScript.
 *
 * Esta biblioteca funciona como um elemento `<canvas>` simplificado. Possui
 * suporte a importação/exportação de imagens de bitmap, e oferece algumas
 * funcionalidades básicas de desenho.
 *
 * Apenas bitmaps no formato 8bpp são suportados.
 */
/**
 * @class Color
 *
 * @description
 * Representa uma cor no formato RGBA.
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
     *
     * @param r Canal de cor vermelho (*red*).
     * @param g Canal de cor verde (*green*).
     * @param b Canal de cor azul (*blue*).
     * @param a Canal de transparência (*alpha*).
     */
    constructor(r?: number, g?: number, b?: number, a?: number);
}
/**
 * @class Bitmap
 *
 * @description
 * Representa uma imagem de bitmap no formato 8bpp.
 */
export declare class Bitmap {
    /** Largura da imagem. */
    width: number;
    /** Altura da imagem. */
    height: number;
    /** Paleta de cores da imagem (max: 256 cores). */
    colors: Color[];
    /** Dados de pixel da imagem. */
    pixels: Uint8Array;
    /**
     * Importa um {@link ArrayBuffer} para uma instância.
     *
     * O formato de bitmap suportado é muito específico:
     * - O cabeçalho deve possuir pelo menos 1078 bytes ou mais.
     * - Deve estar no formato 8bpp, com uma paleta de **exatamente** 256 cores.
     * - O bitmap deve estar descomprimido.
     *
     * @param data Dados.
     */
    static fromArrayBuffer(data: ArrayBuffer): Bitmap;
    /**
     * @constructor
     *
     * @param width Largura da imagem.
     * @param height Altura da imagem.
     * @param colors Paleta de cores da imagem (max: 256 cores).
     * @param pixels Dados de pixel da imagem.
     */
    constructor(width: number, height: number, colors?: Color[], pixels?: ArrayBuffer);
    /**
     * Exporta esta instância para um {@link ArrayBuffer}.
     *
     * @returns {ArrayBuffer}
     */
    toArrayBuffer(): ArrayBuffer;
    /**
     * Verifica se o valor de offset de um pixel está dentro dos limites.
     *
     * Um offset é válido quando seu valor não excede o tamanho máximo de
     * bytes da array de pixels.
     *
     * @param offset Offset do pixel
     *
     * @returns {boolean}
     */
    isOffsetValid(offset: number): boolean;
    /**
     * Verifica se o valor de um índice de cor está dentro dos limites.
     *
     * Um índice de cor é válido quando seu valor não excede o tamanho
     * máximo de cores da paleta.
     *
     * @param color Índice de cor.
     *
     * @returns {boolean}
     */
    isColorValid(color: number): boolean;
    /**
     * Obtém o valor de um pixel na posição especificada.
     * Retorna `-1` quando a posição é inválida.
     *
     * @param x Posição X.
     * @param y Posição Y.
     *
     * @returns {number}
     */
    getPixel(x: number, y: number): number;
    /**
     * Define o valor de um pixel na posição especificada.
     *
     * Para *desenhar*, utilize o método {@link pixel|`pixel()`}.
     *
     * @param x Posição X.
     * @param y Posição Y.
     * @param color Índice de cor.
     *
     * @returns {boolean}
     */
    setPixel(x: number, y: number, color: number): boolean;
    /**
     * Define o valor de um pixel na posição especificada.
     *
     * @param x Posição X.
     * @param y Posição Y.
     * @param color Índice de cor.
     *
     * @returns {this}
     */
    pixel(x: number, y: number, color: number): this;
    /**
     * Desenha uma linha (horizontal).
     *
     * @param x Posição X.
     * @param y Posição Y.
     * @param size Tamanho.
     * @param color Índice de cor.
     *
     * @returns {this}
     */
    hline(x: number, y: number, size: number, color: number): this;
    /**
     * Desenha uma linha (vertical).
     *
     * @param x Posição X.
     * @param y Posição Y.
     * @param size Tamanho.
     * @param color Índice de cor.
     *
     * @returns {this}
     */
    vline(x: number, y: number, size: number, color: number): this;
    /**
     * Desenha um retângulo (bordas).
     *
     * @param x Posição X.
     * @param y Posição Y.
     * @param width Largura.
     * @param height Altura.
     * @param color Índice de cor.
     *
     * @returns {this}
     */
    rectb(x: number, y: number, width: number, height: number, color: number): this;
    /**
     * Desenha um retângulo (preenchido).
     *
     * @param x Posição X.
     * @param y Posição Y.
     * @param width Largura.
     * @param height Altura.
     * @param color Índice de cor.
     *
     * @returns {this}
     */
    rectf(x: number, y: number, width: number, height: number, color: number): this;
    /**
     * Desenha um retângulo.
     *
     * @param x Posição X.
     * @param y Posição Y.
     * @param width Largura.
     * @param height Altura.
     * @param bcolor Índice de cor (bordas).
     * @param fcolor Índice de cor (preenchimento).
     *
     * @returns {this}
     */
    rect(x: number, y: number, width: number, height: number, bcolor: number, fcolor: number): this;
    /**
     * Desenha uma imagem (parcial).
     *
     * @param bitmap Imagem.
     * @param x Posição X.
     * @param y Posição Y.
     * @param cutX Posição X do recorte.
     * @param cutY Posição Y do recorte.
     * @param width Largura do recorte.
     * @param height Altura do recorte.
     * @param mask Máscara de transparência.
     * @param flipX Quando `true`, inverte o recorte horizontalmente.
     * @param flipY Quando `true`, inverte o recorte verticalmente.
     *
     * @returns {this}
     */
    blitsub(bitmap: Bitmap, x: number, y: number, cutX: number, cutY: number, width: number, height: number, mask?: number, flipX?: boolean, flipY?: boolean): this;
    /**
     * Desenha uma imagem (inteira).
     *
     * @param bitmap Imagem.
     * @param x Posição X.
     * @param y Posição Y.
     * @param mask Máscara de transparência.
     * @param flipX Quando `true`, inverte o recorte horizontalmente.
     * @param flipY Quando `true`, inverte o recorte verticalmente.
     *
     * @returns {this}
     */
    blit(bitmap: Bitmap, x: number, y: number, mask?: number, flipX?: boolean, flipY?: boolean): this;
}
//# sourceMappingURL=index.d.ts.map