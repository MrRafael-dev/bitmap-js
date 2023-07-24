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

//#region <color.js>
/**
 * @class Color
 * 
 * @description
 * Representa uma cor no formato RGBA.
 */
export class Color {
	/** Canal de cor vermelho (*red*). */
	public r: number;

	/** Canal de cor verde (*green*). */
	public g: number;

	/** Canal de cor azul (*blue*). */
	public b: number;

	/** Canal de transparência (*alpha*). */
	public a: number;

	/**
	 * 
	 * @param r Canal de cor vermelho (*red*).
	 * @param g Canal de cor verde (*green*).
	 * @param b Canal de cor azul (*blue*).
	 * @param a Canal de transparência (*alpha*).
	 */
	constructor(r: number = 0, g: number = 0, b: number = 0, a: number = 0) {
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	}
}

//#endregion </color.js>
//#region <bitmap.js>
/**
 * @class Bitmap
 * 
 * @description
 * Representa uma imagem de bitmap no formato 8bpp.
 */
export class Bitmap {
	/** Largura da imagem. */
	public width: number;

	/** Altura da imagem. */
	public height: number;

	/** Paleta de cores da imagem (max: 256 cores). */
	public colors: Color[];

	/** Dados de pixel da imagem. */
	public pixels: Uint8Array;

	/**
	 * Importa dados de um arquivo de bitmap para uma instância.
	 * 
	 * O formato de bitmap suportado é muito específico:
	 * - O cabeçalho deve possuir pelo menos 1078 bytes ou mais.
	 * - Deve estar no formato 8bpp, com uma paleta de **exatamente** 256 cores.
	 * - O bitmap deve estar descomprimido.
	 * 
	 * @param data Dados.
	 */
	public static fromFileData(data: ArrayBuffer): Bitmap {
		// Dados do bitmap.
		const dataView: DataView = new DataView(data);

		// Esta biblioteca aceita apenas um formato muito específico de bitmap,
		// e este formato acontece de ter um cabeçalho de exatos 1078 bytes.
		if(dataView.byteLength < 1078) {
			throw new Error("Supported bitmaps must have at least 1078 bytes or more to be accepted.");
		}

		// Dados do cabeçalho.
		const signature   : number = dataView.getUint16( 0, false);
		const dataOffset  : number = dataView.getUint32(10,  true);
		const width       : number = dataView.getUint32(18,  true);
		const height      : number = dataView.getUint32(22,  true);
		const bitsPerPixel: number = dataView.getUint16(28,  true);
		const compression : number = dataView.getUint16(30,  true);

		// Bitmaps são identificados pelo número mágico 0x424D ("BM").
		// Formatos inválidos serão rejeitados.
		if(signature !== 16973) {
			throw new Error("Invalid bitmap signature header. They must start with 0x424D (16973).");
		}

		// O formato de bitmap é tão específico que até o offset do início dos
		// dados de imagem precisam começar no lugar correto.
		if(dataOffset !== 1078) {
			throw new Error("Supported bitmaps must have their image data start exactly at offset 0x00000436 (1078).");
		}

		// Apenas o formato 8bpp é suportado.
		if(bitsPerPixel !== 8) {
			throw new Error(`Supported bitmaps must use the 8bpp format.`);
		}

		// Apenas bitmaps descomprimidos são suportados.
		if(compression !== 0) {
			throw new Error(`Supported bitmaps must be uncompressed.`);
		}

		// Cores da paleta.
		const colors: Color[] = [];

		// Pixels do bitmap;
		const pixelData: Uint8Array = new Uint8Array(
			dataView.buffer.slice(dataOffset, dataOffset + (width * height))
		);

		// Pixels da imagem (com posição Y invertida).
		const pixels: Uint8Array = new Uint8Array(pixelData.byteLength);

		// Percorrer pixels originais do bitmap...
		for(let y: number = 0; y < height; y += 1) {
			const invertY: number = height - y - 1;

			// Inverter posição Y...
			for(let x: number = 0; x < width; x += 1) {
				pixels[(width * y) + x] = pixelData[(width * invertY) + x];
			}
		}

		// Obter paleta de cores...
		for(let index: number = 0; index < 256; index += 1) {
			const offset: number = 54 + (index * 4);

			const b: number = dataView.getUint8(offset + 0);
			const g: number = dataView.getUint8(offset + 1);
			const r: number = dataView.getUint8(offset + 2);
			const a: number = dataView.getUint8(offset + 3);

			colors.push(new Color(r, g, b, a));
		}

		return new Bitmap(width, height, colors, pixels.buffer);
	}

	/**
	 * @constructor
	 * 
	 * @param width Largura da imagem.
	 * @param height Altura da imagem.
	 * @param colors Paleta de cores da imagem (max: 256 cores).
	 * @param pixels Dados de pixel da imagem.
	 */
	constructor(width: number, height: number, colors: Color[] = [], pixels: ArrayBuffer = new ArrayBuffer(0)) {
		this.width  = width;
		this.height = height;
		this.colors = [];
		this.pixels = new Uint8Array(this.width * this.height);

		// Preencher paleta de cores da imagem...
		for(let index: number = 0; index < colors.length; index += 1) {
			const color: Color = colors[index];
			this.colors.push(color);

			// A paleta só pode possuir até, no máximo, 256 cores.
			if(this.colors.length === 256) {
				break;
			}
		}

		// Preencher dados de pixel da imagem...
		const data: Uint8Array = new Uint8Array(pixels.slice(0, this.pixels.byteLength));
		this.pixels.set(data, 0);
	}

	/**
	 * Exporta esta instância para dados de um arquivo de bitmap.
	 * 
	 * @returns {ArrayBuffer}
	 */
	public toFileData(): ArrayBuffer {
		// Tamanho do arquivo + bitmap + dados do bitmap.
		const fileSize: number     = 1078 + this.pixels.byteLength;
		const data    : Uint8Array = new Uint8Array(fileSize);
		const dataView: DataView   = new DataView(data.buffer);
		
		// Escrever cabeçalho básico.
		data.set([
			0x42, 0x4d, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x36, 0x04, 0x00, 0x00, 0x28, 0x00, 
    	0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x08, 0x00, 0x00, 0x00, 
    	0x00, 0x00, 0x20, 0x01, 0x00, 0x00, 0x12, 0x0b, 0x00, 0x00, 0x12, 0x0b, 0x00, 0x00, 0x00, 0x01, 
    	0x00, 0x00, 0x00, 0x01, 0x00,
		], 0);

		// Escrever tamanho do arquivo e dimensões da imagem.
		dataView.setUint32( 2,    fileSize, true);
		dataView.setUint32(18,  this.width, true);
		dataView.setUint32(22, this.height, true);

		// Percorrer cores...
		for(let index: number = 0; index < this.colors.length; index += 1) {
			const color: Color  = this.colors[index];
			const offset: number = 54 + (index * 4);

			// Apenas 256 cores podem ser escritas.
			if(index >= 256) {
				break;
			}

			// Escrever cores.
			data.set([
				color.b, 
				color.g, 
				color.r, 
				color.a,
			], offset);
		}

		// Percorrer pixels da imagem...
		for(let y: number = 0; y < this.height; y += 1) {
			const invertY: number = this.height - y - 1;

			// Inverter posição Y...
			for(let x: number = 0; x < this.width; x += 1) {
				dataView.setUint8(
					1078 + (this.width * invertY) + x, 
					this.pixels[(this.width * y) + x]
				);
			}
		}

		return data.buffer;
	}

	/**
	 * Exporta esta instância para um {@link Uint8ClampedArray}.
	 * 
	 * Esta array pode ser utilizada para exibir a imagem em 
	 * um elemento `<canvas>`.
	 * 
	 * @param mask Máscara de transparência.
	 * 
	 * @returns {Uint8ClampedArray}
	 */
	public toImageData(mask: number = -1): Uint8ClampedArray {
		// Dados de imagem, em formato 32bpp.
		const data: Uint8ClampedArray = new Uint8ClampedArray(this.pixels.byteLength * 4);

		// Percorrer pixels da imagem...
		for(let index: number = 0; index < this.pixels.byteLength; index += 1) {
			const pixel: number = this.pixels[index];

			// Para ser considerado visível, um pixel deve ter um valor diferente da
			// máscara de transparência e ser equivalente a um índice de cor válido:
			if(pixel !== mask && this.isColorValid(pixel)) {
				const color: Color = this.colors[index];

				data[(index * 4) + 0] = color.r;
				data[(index * 4) + 1] = color.g;
				data[(index * 4) + 2] = color.b;
				data[(index * 4) + 3] = color.a;
			}
		}

		return data;
	}

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
	public isOffsetValid(offset: number): boolean {
		return offset >= 0 && offset < this.pixels.byteLength;
	}

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
	public isColorValid(color: number): boolean {
		return color >= 0 && color < this.colors.length;
	}

	/**
	 * Obtém o valor de um pixel na posição especificada.
	 * Retorna `-1` quando a posição é inválida.
	 * 
	 * @param x Posição X.
	 * @param y Posição Y.
	 * 
	 * @returns {number}
	 */
	public getPixel(x: number, y: number): number {
		const offset: number = (this.width * y) + x;

		if(this.isOffsetValid(offset)) {
			return this.pixels[offset];
		}

		return -1;
	}

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
	public setPixel(x: number, y: number, color: number): boolean {
		const offset: number = (this.width * y) + x;

		if(this.isOffsetValid(offset) && this.isColorValid(color)) {
			this.pixels[offset] = color;
			return true;
		}

		return false;
	}

	/**
	 * Define o valor de um pixel na posição especificada.
	 * 
	 * @param x Posição X.
	 * @param y Posição Y.
	 * @param color Índice de cor.
	 * 
	 * @returns {this}
	 */
	public pixel(x: number, y: number, color: number): this {
		this.setPixel(x, y, color);
		return this;
	}

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
	public hline(x: number, y: number, size: number, color: number): this {
		if(size < 0) {
			size = Math.abs(size);
			x -= size;
		}

		for(let index: number = 0; index < size; index += 1) {
			this.pixel(x + index, y, color);
		}

		return this;
	}

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
	public vline(x: number, y: number, size: number, color: number): this {
		if(size < 0) {
			size = Math.abs(size);
			y -= size;
		}

		for(let index: number = 0; index < size; index += 1) {
			this.pixel(x, y + index, color);
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
	 * @param color Índice de cor.
	 * 
	 * @returns {this}
	 */
	public rectb(x: number, y: number, width: number, height: number, color: number): this {
		this.hline(x            , y         , width     , color)
		this.hline(x            , y + height, width     , color)
		this.vline(x            , y + 1     , height - 1, color)
		this.vline(x + width - 1, y + 1     , height - 1, color);

		return this;
	}

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
	public rectf(x: number, y: number, width: number, height: number, color: number): this {
		for(let index: number = 0; index < height; index += 1) {
			this.hline(x, y, width, color);
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
	 * @param bcolor Índice de cor (bordas).
	 * @param fcolor Índice de cor (preenchimento).
	 * 
	 * @returns {this}
	 */
	public rect(x: number, y: number, width: number, height: number, bcolor: number, fcolor: number): this {
		if(this.isColorValid(bcolor)) {
			this.rectb(x, y, width, height, bcolor);
		}

		if(this.isColorValid(fcolor)) {
			this.rectf(x + 1, y + 1, width - 1, height - 1, fcolor);
		}

		return this;
	}

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
	public blitsub(bitmap: Bitmap, x: number, y: number, cutX: number, cutY: number, width: number, height: number, mask: number = -1, flipX: boolean = false, flipY: boolean = false): this {
		for(let bitmapY: number = 0; bitmapY < height; bitmapY += 1) {
			for(let bitmapX: number = 0; bitmapX < width; bitmapX += 1) {
				const pixel: number = bitmap.getPixel(bitmapX + cutX, bitmapY + cutY);

				if(pixel !== mask) {
					this.setPixel(
						flipX? (width  - 1) - (x + bitmapX): x + bitmapX, 
						flipY? (height - 1) - (y + bitmapY): y + bitmapY,
						pixel
					);
				}
			}
		}

		return this;
	}

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
	public blit(bitmap: Bitmap, x: number, y: number, mask: number = -1, flipX: boolean = false, flipY: boolean = false): this {
		this.blitsub(bitmap, x, y, 0, 0, bitmap.width, bitmap.height, mask, flipX, flipY);
		return this;
	}
}

//#endregion </bitmap.js>
