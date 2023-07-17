/**
 * 
 */

//#region <color.js>
/**
 * @class Color
 * 
 * @description
 * Representa uma cor no formato RGBA.
 */
export class Color {
	/**
	 * 
	 * @param {number} red Canal de cor vermelho (*red*).
	 * @param {number} green Canal de cor verde (*green*).
	 * @param {number} blue Canal de cor azul (*blue*).
	 * @param {number} alpha Canal de transparência (*alpha*).
	 */
	constructor(red = 0, green = 0, blue = 0, alpha = 0) {
		/**
		 * @type {number}
		 * Canal de cor vermelho (*red*).
		 */
		this.red = red;

		/**
		 * @type {number}
		 * Canal de cor verde (*green*).
		 */
		this.green = green;

		/**
		 * @type {number}
		 * Canal de cor azul (*blue*).
		 */
		this.blue = blue;

		/**
		 * @type {number}
		 * Canal de transparência (*alpha*).
		 */
		this.alpha = alpha;
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
	/**
	 * @constructor
	 * 
	 * @param {number} width Largura da imagem.
	 * @param {number} height Altura da imagem.
	 * @param {Color[]} colors Paleta de cores da imagem (max: 256 cores).
	 * @param {ArrayBuffer|null} pixels Dados de pixel da imagem.
	 */
	constructor(width = 0, height = 0, colors = [], pixels = null) {
		/**
		 * @type {number}
		 * Largura da imagem.
		 */
		this.width = width;

		/**
		 * @type {number}
		 * Altura da imagem.
		 */
		this.height = height;

		/**
		 * @type {Color[]} Paleta de cores da imagem (max: 256 cores).
		 */
		this.colors = [];

		/**
		 * @type {Uint8Array}
		 * Dados de pixel da imagem.
		 */
		this.pixels = new Uint8Array(this.width * this.height);

		// Preencher paleta de cores da imagem...
		for(const color of colors) {
			this.colors.push(color);

			// A paleta só pode possuir até, no máximo, 256 cores.
			if(this.colors.length === 256) {
				break;
			}
		}

		// Preencher dados de pixel da imagem...
		if(pixels instanceof ArrayBuffer) {
			const data = new Uint8Array(pixels.slice(0, this.pixels.byteLength));
			this.pixels.set(data, 0);
		}
	}

	/**
	 * Verifica se o valor de offset de um pixel está dentro dos limites.
	 * 
	 * Um offset é válido quando seu valor não excede o tamanho máximo de
	 * bytes da array de pixels.
	 * 
	 * @param {number} offset Offset do pixel
	 * 
	 * @returns {boolean}
	 */
	isOffsetValid(offset) {
		return offset >= 0 && offset < this.pixels.byteLength;
	}

	/**
	 * Verifica se o valor de um índice de cor está dentro dos limites.
	 * 
	 * Um índice de cor é válido quando seu valor não excede o tamanho
	 * máximo de cores da paleta.
	 * 
	 * @param {number} color Índice de cor.
	 * 
	 * @returns {boolean}
	 */
	isColorValid(color) {
		return color >= 0 && color < this.colors.length;
	}

	/**
	 * Obtém o valor de um pixel na posição especificada.
	 * Retorna `-1` quando a posição é inválida.
	 * 
	 * @param {number} x Posição X.
	 * @param {number} y Posição Y.
	 * 
	 * @returns {number}
	 */
	getPixel(x = 0, y = 0) {
		const offset = (this.width * y) + x;

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
	 * @param {number} x Posição X.
	 * @param {number} y Posição Y.
	 * @param {number} color Índice de cor.
	 * 
	 * @returns {boolean}
	 */
	setPixel(x = 0, y = 0, color = -1) {
		const offset = (this.width * y) + x;

		if(this.isOffsetValid(offset) && this.isColorValid(color)) {
			this.pixels[offset] = color;
			return true;
		}

		return false;
	}

	/**
	 * Define o valor de um pixel na posição especificada.
	 * 
	 * @param {number} x Posição X.
	 * @param {number} y Posição Y.
	 * @param {number} color Índice de cor.
	 * 
	 * @returns {this}
	 */
	pixel(x = 0, y = 0, color = -1) {
		this.setPixel(x, y, color);
		return this;
	}

	/**
	 * Desenha uma linha horizontal.
	 * 
	 * @param {number} x Posição X.
	 * @param {number} y Posição Y.
	 * @param {number} size Tamanho.
	 * @param {number} color Índice de cor.
	 * 
	 * @returns {this}
	 */
	hline(x = 0, y = 0, size = 0, color = -1) {
		for(let index = 0; index < size; index += 1) {
			this.setPixel(x + index, y, color);
		}

		return this;
	}

	/**
	 * Desenha uma linha vertical.
	 * 
	 * @param {number} x Posição X.
	 * @param {number} y Posição Y.
	 * @param {number} size Tamanho.
	 * @param {number} color Índice de cor.
	 * 
	 * @returns {this}
	 */
	vline(x = 0, y = 0, size = 0, color = -1) {
		for(let index = 0; index < size; index += 1) {
			this.setPixel(x, y + index, color);
		}

		return this;
	}

	/**
	 * Desenha um retângulo (apenas bordas).
	 * 
	 * @param {number} x Posição X.
	 * @param {number} y Posição Y.
	 * @param {number} width Largura.
	 * @param {number} height Altura.
	 * @param {number} border Índice de cor (bordas).
	 * @param {number} fill Índice de cor (preenchimento).
	 * 
	 * @returns {this}
	 */
	rect(x = 0, y = 0, width = 0, height = 0, border = -1, fill = -1) {
		// Desenhar bordas...
		this.hline(x            , y         , width     , border)
				.hline(x            , y + height, width     , border)
				.vline(x            , y + 1     , height - 1, border)
				.vline(x + width - 1, y + 1     , height - 1, border);
		
		// Desenhar preenchimento...
		for(let index = 1; index < height; index += 1) {
			this.hline(x + 1, y + index, width - 2, fill);
		}

		return this;
	}

	/**
	 * 
	 * @param {Bitmap} bitmap Imagem.
	 * @param {number} x Posição X.
	 * @param {number} y Posição Y.
	 * @param {number} cutX Posição X do recorte.
	 * @param {number} cutY Posição Y do recorte.
	 * @param {number} width Largura do recorte.
	 * @param {number} height Altura do recorte.
	 * @param {number} mask Máscara de transparência.
	 * @returns 
	 */
	blitsub(bitmap, x = 0, y = 0, cutX = 0, cutY = 0, width = 0, height = 0, mask = -1) {
		for(let bitmapY = 0; bitmapY < height; bitmapY += 1) {
			for(let bitmapX = 0; bitmapX < width; bitmapX += 1) {
				const pixel = bitmap.getPixel(bitmapX + cutX, bitmapY + cutY);

				if(pixel !== mask) {
					this.setPixel(x + bitmapX, y + bitmapY, pixel);
				}
			}
		}

		return this;
	}

	/**
	 * Desenha um bitmap.
	 * 
	 * @param {Bitmap} bitmap Imagem.
	 * @param {number} x Posição X.
	 * @param {number} y Posição Y.
	 * @param {number} mask Máscara de transparência.
	 * 
	 * @returns {this}
	 */
	blit(bitmap, x = 0, y = 0, mask = -1) {
		this.blitsub(bitmap, x, y, 0, 0, bitmap.width, bitmap.height, mask);

		return this;
	}

	/**
	 * Importa um arquivo de bitmap para uma instância.
	 * 
	 * O formato de bitmap suportado é muito específico:
	 * - O cabeçalho deve possuir pelo menos 1078 bytes ou mais.
	 * - Deve estar no formato 8bpp, com uma paleta de **exatamente** 256 cores.
	 * - O bitmap deve estar descomprimido.
	 * 
	 * @param {ArrayBuffer} data 
	 */
	static fromData(data) {
		// Dados do bitmap.
		const dataView = new DataView(data);

		// Esta biblioteca aceita apenas um formato muito específico de bitmap,
		// e este formato acontece de ter um cabeçalho de exatos 1078 bytes.
		if(dataView.byteLength < 1078) {
			throw new Error("Supported bitmaps must have at least 1078 bytes or more to be accepted.");
		}

		// Dados do cabeçalho.
		const signature    = dataView.getUint16( 0, false);
		const dataOffset   = dataView.getUint32(10,  true);
		const width        = dataView.getUint32(18,  true);
		const height       = dataView.getUint32(22,  true);
		const bitsPerPixel = dataView.getUint16(28,  true);
		const compression  = dataView.getUint16(30,  true);

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
		const colors = [];

		// Pixels do bitmap;
		const pixelData = new Uint8Array(
			dataView.buffer.slice(dataOffset, dataOffset + (width * height))
		);

		// Pixels da imagem (com posição Y invertida).
		const pixels = new Uint8Array(pixelData.byteLength);

		// Percorrer pixels originais do bitmap...
		for(let y = 0; y < height; y += 1) {
			const invertY = height - y - 1;

			// Inverter posição Y...
			for(let x = 0; x < width; x += 1) {
				pixels[(width * y) + x] = pixelData[(width * invertY) + x];
			}
		}

		// Obter paleta de cores...
		for(let index = 0; index < 256; index += 1) {
			const offset = 54 + (index * 4);

			const blue  = dataView.getUint8(offset + 0);
			const green = dataView.getUint8(offset + 1);
			const red   = dataView.getUint8(offset + 2);
			const alpha = dataView.getUint8(offset + 3);

			colors.push(new Color(red, green, blue, alpha));
		}

		return new Bitmap(width, height, colors, pixels.buffer);
	}

	/**
	 * Exporta esta instância para um arquivo de bitmap.
	 * 
	 * @returns {ArrayBuffer}
	 */
	toData() {
		// Tamanho do arquivo + bitmap + dados do bitmap.
		const fileSize = 1078 + this.pixels.byteLength;
		const data     = new Uint8Array(fileSize);
		const dataView = new DataView(data.buffer);
		
		// Escrever cabeçalho básico.
		data.set([
			0x42, 0x4d, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x36, 0x04, 0x00, 0x00, 0x28, 0x00, 
    	0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x08, 0x00, 0x00, 0x00, 
    	0x00, 0x00, 0x20, 0x01, 0x00, 0x00, 0x12, 0x0b, 0x00, 0x00, 0x12, 0x0b, 0x00, 0x00, 0x00, 0x01, 
    	0x00, 0x00, 0x00, 0x01, 0x00,
		], 0);

		// Escrever tamanho do arquivo e dimensões da imagem.
		dataView.setUint32( 2, fileSize, true);
		dataView.setUint32(18, this.width, true);
		dataView.setUint32(22, this.height, true);

		// Percorrer cores...
		for(let index = 0; index < this.colors.length; index += 1) {
			const color  = this.colors[index];
			const offset = 54 + (index * 4);

			// Apenas 256 cores podem ser escritas.
			if(index >= 256) {
				break;
			}

			// Escrever cores.
			data.set([
				color.blue, 
				color.green, 
				color.red, 
				color.alpha,
			], offset);
		}

		// Percorrer pixels da imagem...
		for(let y = 0; y < this.height; y += 1) {
			const invertY = this.height - y - 1;

			// Inverter posição Y...
			for(let x = 0; x < this.width; x += 1) {
				dataView.setUint8(
					1078 + (this.width * invertY) + x, 
					this.pixels[(this.width * y) + x]
				);
			}
		}

		return data.buffer;
	}
}

//#endregion </bitmap.js>
