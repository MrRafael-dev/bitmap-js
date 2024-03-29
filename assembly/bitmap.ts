/**
 * @name bitmap-js
 * @author MrRafael-dev
 * @license MIT
 * @version 1.0.11
 * 
 * @description
 * Biblioteca de *bitmap* simples para *AssemblyScript*.
 * 
 * Esta biblioteca permite importar/exportar *bitmaps* e oferece algumas
 * funcionalidades básicas de desenho.
 * 
 * Apenas *bitmaps* descomprimido com uma paleta 
 * de 256 cores (formato *8bpp*) são suportados.
 */

//#region <color.ts>
/**
 * @class Color
 * 
 * @description
 * Representa uma cor no formato *RGBA*.
 */
export class Color {
	/** Canal de cor vermelho (*red*). */
	public r: u8;

	/** Canal de cor verde (*green*). */
	public g: u8;

	/** Canal de cor azul (*blue*). */
	public b: u8;

	/** Canal de transparência (*alpha*). */
	public a: u8;

	/**
	 * Importa uma cor a partir de uma *string* hexadecimal.
	 * 
	 * @param value *String* hexadecimal. (ex: `#9E42F5FF`)
	 * 
	 * @returns {Color}
	 */
	public static fromHexString(value: string): Color {
		/** Resultado. */
		const result: Color = new Color(0, 0, 0, 0);
		
		/** *Set* de caracteres válidos para uma *string* hexadecimal. */
		const charset: string = "0123456789abcdef";

		/** Bytes de cor. */
		let bytes: Uint8Array = new Uint8Array(8);

		/** *String* hexadecimal, em letras minúsculas. */
		const lowerValue: string = value.toLowerCase();

		// Percorrer e coletar bytes...
		for(let index: i32 = 0; index < bytes.length; index += 1) {
			const char: string = lowerValue.charAt(index + 1);

			// Ignorar identificador "#"...
			if(index === 0 && char === "#") {
				continue;
			}

			const charIndex: i32 = charset.indexOf(char);
			bytes[index] = charIndex >= 0? charIndex: 0;
		}

		// Calcular e definir bytes de cor...
		result.r = (bytes[0] * 0x10) + bytes[1];
		result.g = (bytes[2] * 0x10) + bytes[3];
		result.b = (bytes[4] * 0x10) + bytes[5];
		result.a = (bytes[6] * 0x10) + bytes[7];

		return result;
	}

	/**
	 * @constructor
	 * 
	 * @param r Canal de cor vermelho (*red*).
	 * @param g Canal de cor verde (*green*).
	 * @param b Canal de cor azul (*blue*).
	 * @param a Canal de transparência (*alpha*).
	 */
	public constructor(r: u8, g: u8, b: u8, a: u8 = 0) {
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
	public toHexString(): string {
		const r: string = this.r.toString(16).padStart(2, "0");
		const g: string = this.g.toString(16).padStart(2, "0");
		const b: string = this.b.toString(16).padStart(2, "0");
		const a: string = this.a.toString(16).padStart(2, "0");

		return `${r}${g}${b}${a}`;
	}

	/**
	 * Redefine todos os valores desta instância.
	 * 
	 * @param r Canal de cor vermelho (*red*).
	 * @param g Canal de cor verde (*green*).
	 * @param b Canal de cor azul (*blue*).
	 * @param a Canal de transparência (*alpha*).
	 * 
	 * @returns {this}
	 */
	public setValues(r: u8, g: u8, b: u8, a: u8): this {
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;

		return this;
	}

	/**
	 * Limpa todos os valores desta instância, redefinindo suas
	 * propriedades para valores considerados vazios.
	 * 
	 * @returns {this}
	 */
	public reset(): this {
		this.setValues(0, 0, 0, 0);
		return this;
	}

	/**
	 * Copia todos os valores desta instância para outra.
	 * 
	 * @param instance Instância.
	 * 
	 * @returns {this}
	 */
	public copyTo(instance: Color): this {
		instance.setValues(this.r, this.g, this.b, this.a);
		return this;
	}

	/**
	 * Copia todos os valores de outra instância para esta.
	 * 
	 * @param instance Instância.
	 * 
	 * @returns {this}
	 */
	public copyFrom(instance: Color): this {
		this.setValues(instance.r, instance.g, instance.b, instance.a);
		return this;
	}

	/**
	 * Cria uma cópia desta instância.
	 * 
	 * @returns {Color}
	 */
	public createCopy(): Color {
		return new Color(this.r, this.g, this.b, this.a);
	}
}

//#endregion </color.ts>
//#region <pixel_shader.ts>
/**
 * @class Pixel
 * 
 * @description
 * Estrutura representativa de um *pixel*.
 * 
 * É utilizado para receber/retornar os dados de
 * um *pixel* modificado por um *pixel shader*.
 */
export class Pixel {
	/** Posição X. */
	public x: i32;

	/** Posição Y. */
	public y: i32;

	/** Índice equivalente à cor da paleta. */
	public color: i32;

	/**
	 * @constructor
	 * 
	 * @param x Posição X.
	 * @param y Posição Y.
	 * @param color Índice equivalente à cor da paleta.
	 */
	public constructor(x: i32, y: i32, color: i32) {
		this.x = x;
		this.y = y;
		this.color = color;
	}

	/**
	 * Redefine todos os valores desta instância.
	 * 
	 * @param x Posição X.
	 * @param y Posição Y.
	 * @param color Índice equivalente à cor da paleta.
	 * 
	 * @returns {this}
	 */
	public setValues(x: i32, y: i32, color: i32): this {
		this.x = x;
		this.y = y;
		this.color = color;

		return this;
	}

	/**
	 * Limpa todos os valores desta instância, redefinindo suas
	 * propriedades para valores considerados vazios.
	 * 
	 * @returns {this}
	 */
	public reset(): this {
		this.setValues(0, 0, -1);
		return this;
	}

	/**
	 * Copia todos os valores desta instância para outra.
	 * 
	 * @param instance Instância.
	 * 
	 * @returns {this}
	 */
	public copyTo(instance: Pixel): this {
		instance.setValues(this.x, this.y, this.color);
		return this;
	}

	/**
	 * Copia todos os valores de outra instância para esta.
	 * 
	 * @param instance Instância.
	 * 
	 * @returns {this}
	 */
	public copyFrom(instance: Pixel): this {
		this.setValues(instance.x, instance.y, instance.color);
		return this;
	}

	/**
	 * Cria uma cópia desta instância.
	 * 
	 * @returns {Pixel}
	 */
	public createCopy(): Pixel {
		return new Pixel(this.x, this.y, this.color);
	}
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
	 * O *pixel* original e novo *pixel* são passados como uma cópia ao invés
	 * de referência. Para aplicar os efeitos, um *pixel* deve ser retornado.
	 * 
	 * @param previous *Pixel* original.
	 * @param next Novo *pixel*.
	 * 
	 * @returns {Pixel}
	 */
	pixelShader(previous: Pixel, next: Pixel): Pixel;
}

//#endregion </pixel_shader.ts>
//#region <drawable.ts>
/**
 * @interface Drawable
 * 
 * @description
 * Estrutura representativa de um *bitmap*.
 * 
 * Esta estrutura pode ser usada para implementar um novo formato de imagem,
 * que poderá então ser usado por uma *surface*.
 */
export interface Drawable {
	/** Largura da imagem. */
	width: i32;

	/** Altura da imagem. */
	height: i32;

	/** Dados da imagem. */
	data: Uint8Array;

	/**
	 * Define um *pixel* na posição especificada.
	 * 
	 * @param x Posição X.
	 * @param y Posição Y.
	 * @param primaryColor Cor da paleta (primária).
	 * 
	 * @returns {bool}
	 */
	setPixel(x: i32, y: i32, primaryColor: i32): bool;
	
	/**
	 * Obtém um *pixel* na posição especificada,
	 * ou um valor distinto, caso não exista.
	 * 
	 * @param x Posição X.
	 * @param y Posição Y.
	 * 
	 * @returns {i32}
	 */
	getPixel(x: i32, y: i32): i32;

	/**
	 * Limpa todo o conteúdo da imagem.
	 * 
	 * @param primaryColor Cor da paleta (primária).
	 * 
	 * @returns {bool}
	 */
	clearImage(primaryColor: i32): bool;
}

//#endregion </drawable.ts>
//#region <bitmap.ts>
/**
 * @enum BitmapOffset
 * 
 * @description
 * Enumerador de *offsets* de metadados do *bitmap*.
 */
enum BitmapOffset {
	/** Tamanho do cabeçalho (incluindo paleta). */
	HEADER_SIZE = 1078,
	
	/** Número mágico ("BM"). */
	HEADER_BM = 16973,

	/** (*Offset*) Número mágico ("BM"). */
	HEADER_MAGIC = 0,

	/** (*Offset*) *Offset* dos ados da imagem. */
	HEADER_DATA = 10,

	/** (*Offset*) Tamanho do arquivo, em *bytes*. */
	HEADER_FILESIZE = 2,

	/** (*Offset*) Largura do *bitmap*, em *pixels*. */
	HEADER_WIDTH= 18,

	/** (*Offset*) Altura do *bitmap*, em *pixels*. */
	HEADER_HEIGHT = 22,

	/** (*Offset*) Formato de cores (*bits per pixel*). */
	HEADER_COLOR_FORMAT = 28,

	/** (*Offset*) Formato de compressão. */
	HEADER_COMPRESSION = 30,

	/** Número de cores da paleta. */
	PALETTE_SIZE = 256,

	/** (*Offset*) Posição da paleta de cores. */
	PALETTE_START = 54,
}

/**
 * @class Bitmap @implements Drawable
 * 
 * @description
 * Representa um *bitmap* descomprimido com
 * uma paleta de 256 cores (formato *8bpp*).
 */
export class Bitmap implements Drawable {
	/** Largura. */
	private _width: i32;

	/** Altura. */
	private _height: i32;

	/** Tamanho da área da imagem, em *pixels*. */
	private _size: i32;

	/** Número de cores disponíveis na paleta. */
	private _paletteSize: i32;

	/** Dados da imagem. */
	private _data: Uint8Array;

	/**
	 * Importa um *bitmap* a partir dos dados de um arquivo.
	 * 
	 * @param file Arquivo.
	 * 
	 * @returns {Bitmap}
	 */
	public static from(file: Uint8Array): Bitmap {
		// Esta biblioteca aceita apenas um formato muito específico de bitmap,
		// e este formato acontece de ter um cabeçalho de exatos 1078 bytes.
		if(file.byteLength < BitmapOffset.HEADER_SIZE) {
			throw new Error("Supported bitmaps must have at least 1078 bytes or more to be accepted.");
		}

		/** Visualizador de dados do arquivo. */
		const fileView: DataView = new DataView(file.buffer);

		/** (Número mágico ("BM"). */
		const signature: i32 = fileView.getUint16(BitmapOffset.HEADER_MAGIC, false);

		/** *Offset* dos ados da imagem. */
		const dataOffset: i32 = fileView.getUint32(BitmapOffset.HEADER_DATA, true);

		/** Largura do *bitmap*, em *pixels*. */
		const width: i32 = fileView.getUint32(BitmapOffset.HEADER_WIDTH, true);

		/** Altura do *bitmap*, em *pixels*. */
		const height: i32 = fileView.getUint32(BitmapOffset.HEADER_HEIGHT, true);

		/** Formato de cores (*bits per pixel*). */
		const bitsPerPixel: i32 = fileView.getUint16(BitmapOffset.HEADER_COLOR_FORMAT, true);

		/** Formato de compressão. */
		const compression: i32 = fileView.getUint16(BitmapOffset.HEADER_COMPRESSION, true);
		
		// Bitmaps são identificados pelo número mágico 0x424D ("BM").
		// Formatos inválidos serão rejeitados.
		if(signature !== BitmapOffset.HEADER_BM) {
			throw new Error("Invalid bitmap signature header. They must start with 0x424D (16973).");
		}

		// O formato de bitmap é tão específico que até o offset do início dos
		// dados de imagem precisam começar no lugar correto.
		if(dataOffset !== BitmapOffset.HEADER_SIZE) {
			throw new Error("Supported bitmaps must have their image data start exactly at offset 0x00000436 (1078).");
		}

		// Bitmaps devem ter um tamanho pelo menos de 1x1.
		// Tamanhos inválidos serão rejeitados.
		if(width <= 0 || height <= 0) {
			throw new Error("Invalid bitmap size. Width and height must be at least 1 pixel each.");
		}

		// Apenas o formato 8bpp é suportado.
		if(bitsPerPixel !== 8) {
			throw new Error("Supported bitmaps must use the 8bpp format.");
		}

		// Apenas bitmaps descomprimidos são suportados.
		if(compression !== 0) {
			throw new Error("Supported bitmaps must be uncompressed.");
		}

		/** *Bitmap* a ser retornado. */
		const result: Bitmap = new Bitmap(width, height);

		/** Dados de paleta e imagem do arquivo. */
		const fragment: Uint8Array = file.slice(BitmapOffset.PALETTE_START, file.byteLength);

		result.data.set(fragment, BitmapOffset.PALETTE_START);
		return result;
	}

	/**
	 * @constructor
	 * 
	 * @param width Largura.
	 * @param height Altura.
	 * @param colors Cores.
	 */
	public constructor(width: i32, height: i32, colors: Color[] = []) {
		// Bitmaps devem ter um tamanho pelo menos de 1x1.
		// Tamanhos inválidos serão rejeitados.
		if(width <= 0 || height <= 0) {
			throw new Error("Invalid bitmap size. Width and height must be at least 1 pixel each.");
		}

		/** Tamanho da área da imagem, em *pixels*. */
		const size: i32 = width * height;

		this._width = width;
		this._height = height;
		this._size = size;
		this._paletteSize = BitmapOffset.PALETTE_SIZE;
		this._data = new Uint8Array(BitmapOffset.HEADER_SIZE + size);

		/** Visualizador de dados da imagem. */
		const view: DataView = new DataView(this._data.buffer);
		
		/**
 		 * Cabeçalho padrão.
 		 *
 		 * Assume-se um *bitmap* descomprimido com
 		 * uma paleta de 256 cores (formato *8bpp*).
 		 */
		const defaultHeader: Uint8Array = new Uint8Array(54);
		
		// Escrever cabeçalho padrão...
		defaultHeader.set([
			0x42, 0x4d,             // Número mágico ("BM").
			0x00, 0x00, 0x00, 0x00, // Tamanho do arquivo, em bytes.
			0x00, 0x00, 0x00, 0x00, // Reservado (sem uso).
			0x36, 0x04, 0x00, 0x00, // Offset dos dados da imagem.
			0x28, 0x00, 0x00, 0x00, // Tamanho do cabeçalho.
			0x00, 0x00, 0x00, 0x00, // Largura do bitmap, em pixels.
			0x00, 0x00, 0x00, 0x00, // Altura do bitmap, em pixels.
			0x01, 0x00,             // Número de planos de cor.
			0x08, 0x00,             // Formato de cores (bits per pixel).
			0x00, 0x00, 0x00, 0x00, // Formato de compressão.
			0x00, 0x00, 0x00, 0x00, // Tamanho da imagem (quando comprimida).
			0x12, 0x0b, 0x00, 0x00, // Resolução horizontal (pixels/metro).
			0x12, 0x0b, 0x00, 0x00, // Resolução vertical (pixels/metro).
			0x00, 0x01, 0x00, 0x00, // Número de cores em uso.
			0x00, 0x01, 0x00, 0x00, // Número de cores importantes.
		]);

		// Inserir cabeçalho...
		this._data.set(defaultHeader, 0);

		// Escrever tamanho do arquivo e altura/largura da imagem...
		view.setUint32(BitmapOffset.HEADER_FILESIZE, this._data.byteLength, true);
		view.setUint32(BitmapOffset.HEADER_WIDTH, this.width, true);
		view.setUint32(BitmapOffset.HEADER_HEIGHT, this.height, true);

		// Inserir paleta de cores...
		this.setPalette(colors);
	}
	
	/**
	 * Exporta os dados da imagem para uma *array* de *bytes* no formato RGBA.
	 * Este é o mesmo formato utilizado em elementos `<canvas>`.
	 * 
	 * @param mask Máscara de transparência.
	 * 
	 * @returns {Uint8ClampedArray}
	 */
	public toImageData(mask: i32 = -1): Uint8ClampedArray {
		/** Resultado a ser retornado. */
		const result: Uint8ClampedArray = new Uint8ClampedArray(this._size * 4);

		// Percorrer pixels da imagem...
		for(let y: i32 = 0; y < this._height; y += 1) {
			for(let x: i32 = 0; x < this._width; x += 1) {
				/** *Pixel*. */
				const pixel: i32 = this.getPixel(x, y);

				// Ignorar máscara de transparência...
				if(pixel === mask) {
					continue;
				}

				/** Cor da paleta equivalente ao *pixel* obtido. */
				const color: Color = this.getColor(pixel);

				/** Índice a ser alterado no resultado. */
				const index: i32 = ((this._width * y) + x) * 4;

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

	public get width(): i32 {
		return this._width;
	}

	public get height(): i32 {
		return this._height;
	}

	public get data(): Uint8Array {
		return this._data;
	}

	public setPixel(x: i32, y: i32, primaryColor: i32): bool {
		// A posição deve estar na área de desenho e
		// o índice deve estar entre o tamanho da paleta.
		// Do contrário, nada será feito.
		if(!this.withinImage(x, y) || !this.withinPalette(primaryColor)) {
			return false;
		}
		
		/** Posição X, convertida para número inteiro. */
		const px: i32 = x < 0? i32(Math.floor(x)): i32(Math.ceil(x));

		/** Posição Y, convertida para número inteiro. */
		const py: i32 = y < 0? i32(Math.floor(y)): i32(Math.ceil(y));

		/** Posição Y, invertida. */
		const iy: i32 = (this._height - 1) - py;

		/** *Offset* do *pixel*. */
		const offset: i32 = BitmapOffset.HEADER_SIZE + (this._width * iy) + px;

		this._data[offset] = primaryColor;
		return true;
	}

	public getPixel(x: i32, y: i32): i32 {
		// A posição deve estar na área de desenho.
		// Do contrário, será retornado uma cor de paleta negativa.
		if(!this.withinImage(x, y)) {
			return -1;
		}

		/** Posição Y, invertida. */
		const iy: i32 = (this._height - 1) - y;

		/** *Offset* do *pixel*. */
		const offset: i32 = BitmapOffset.HEADER_SIZE + (this._width * iy) + x;

		return this._data[offset];
	}

	public clearImage(primaryColor: i32): bool {
		this.data.fill(primaryColor, BitmapOffset.HEADER_SIZE);
		return true;
	}

	/** Tamanho da área da imagem, em *pixels*. */
	public get size(): i32 {
		return this._size;
	}

	/** Número de cores disponíveis na paleta. */
	public get paletteSize(): i32 {
		return this._paletteSize;
	}

	/**
	 * Indica se uma determinada posição está dentro da área de desenho.
	 * 
	 * @param x Posição X.
	 * @param y Posição Y.
	 * 
	 * @returns {bool}
	 */
	public withinImage(x: i32, y: i32): bool {
		return x >= 0 && x < this._width && y >= 0 && y < this._height;
	}

	/**
	 * Indica se um determinado índice de cor está dentro da paleta de cores.
	 * 
	 * @param index Índice da paleta.
	 * 
	 * @returns {bool}
	 */
	public withinPalette(index: i32): bool {
		return index >= 0 && index < this._paletteSize;
	}

	/**
	 * Define uma cor da paleta no índice especificado.
	 * 
	 * @param index Índice da paleta.
	 * @param color Cor.
	 * 
	 * @returns {bool}
	 */
	public setColor(index: i32, color: Color): bool {
		// O índice deve estar entre o tamanho da paleta.
		// Do contrário, nada será feito.
		if(!this.withinPalette(index)) {
			return false;
		}

		/** *Offset* da paleta. */
		const offset: i32 = BitmapOffset.PALETTE_START + (index * 4);

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
	public getColor(index: i32): Color {
		// O índice deve estar entre o tamanho da paleta.
		// Do contrário, será retornada uma cor padrão.
		if(!this.withinPalette(index)) {
			return new Color(0, 0, 0, 0);
		}

		/** *Offset* da paleta. */
		const offset: i32 = BitmapOffset.PALETTE_START + (index * 4);

		return new Color(
			this._data[offset + 2],
			this._data[offset + 1],
			this._data[offset],
			this._data[offset + 3]
		);
	}

	/**
	 * Define uma nova paleta de cores.
	 * 
	 * @param colors Cores.
	 * 
	 * @returns {bool}
	 */
	public setPalette(colors: Color[]): bool {
		/** Resultado final. */
		let result: bool = true;

		for(let index: i32 = 0; index < colors.length; index += 1) {
			const color: Color = colors[index];
			const colorResult: bool = this.setColor(index, color);

			// Sinalizar resultado final, caso necessário...
			if(!colorResult) {
				result = false;
			}

			// Não exceder o tamanho da paleta...
			if(index >= this._paletteSize) {
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
	public getPalette(): Color[] {
		/** Resultado. */
		const result: Color[] = [];

		// Percorrer cores da paleta...
		for(let index: i32 = 0; index < this._paletteSize; index += 1) {
			const color: Color = this.getColor(index);
			result.push(color);
		}

		return result;
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
	public getPixelColor(x: i32, y: i32): Color {
		const index: i32 = this.getPixel(x, y);
		const color: Color =  this.getColor(index);

		return color;
	}
}

//#endregion </bitmap.ts>
//#region <surface.ts>
/**
 * @class Surface
 * 
 * @description
 * Representa uma camada de abstração para um *bitmap*.
 * Com uma *surface*, é possível realizar uma série de operações básicas
 * de desenho, como linhas, retângulos e outros *bitmaps*.
 */
export class Surface<T extends Drawable> {
	/** *Bitmap*. */
	private _drawable: T;

	/**
	 * @constructor
	 * 
	 * @param drawable *Bitmap*.
	 */
	public constructor(drawable: T) {
		this._drawable = drawable;
	}

	public get drawable(): T {
		return this._drawable;
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
	public pixel(x: i32, y: i32, primaryColor: i32, shaders: PixelShader[] = []): this {
		/** *Pixel* original. */
		let previous: Pixel = new Pixel(x, y, this._drawable.getPixel(x, y));

		/** Novo *pixel*. */
		let next: Pixel = new Pixel(x, y, primaryColor);

		// Aplicar pixel shaders...
		for(let index: i32 = 0; index < shaders.length; index += 1) {
			const shader: PixelShader = shaders[index];
			const result: Pixel = shader.pixelShader(
				previous.createCopy(), 
				next.createCopy()
			);

			// Avançar sequência de pixels...
			previous = next;
			next = result;
		}

		this._drawable.setPixel(next.x, next.y, next.color);
		return this;
	}

	/**
	 * Limpa todo o conteúdo da imagem.
	 * 
	 * @param primaryColor Cor da paleta (primária).
	 * 
	 * @returns {this}
	 */
	public clear(primaryColor: i32): this {
		this._drawable.clearImage(primaryColor);
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
	public hline(x: i32, y: i32, size: i32, primaryColor: i32, shaders: PixelShader[] = []): this {
		// Desenhar pixels...
		for(let index: i32 = 0; index < size; index += 1) {
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
	public vline(x: i32, y: i32, size: i32, primaryColor: i32, shaders: PixelShader[] = []): this {
		// Desenhar pixels...
		for(let index: i32 = 0; index < size; index += 1) {
			this.pixel(x, y + index, primaryColor, shaders);
		}

		return this;
	}

	/**
	 * Desenha uma linha (algoritmo de *Bresenham*).
	 * 
	 * @param x1 Posição X inicial.
	 * @param y1 Posição Y inicial.
	 * @param x2 Posição X final.
	 * @param y2 Posição Y final.
	 * @param primaryColor Cor da paleta (primária).
	 * @param shaders *Pixel shaders*.
	 * 
	 * @returns {this}
	 */
	public line(x1: i32, y1: i32, x2: i32, y2: i32, primaryColor: i32, shaders: PixelShader[] = []): this {
		let width: i32 = x2 - x1;
    let height: i32 = y2 - y1;
		let longest: i32 = i32(Math.abs(width));
    let shortest: i32 = i32(Math.abs(height));
    let dx1: i32 = 0;
		let dy1: i32 = 0;
		let dx2: i32 = 0;
		let dy2: i32 = 0;

    if(width < 0) {
			dx1 = -1;
			dx2 = -1;
		}
		else if(width > 0) {
			dx1 = 1;
			dx2 = 1;
		}

    if(height < 0) {
			dy1 = -1;
		}
		else if(height > 0) {
			dy1 =  1;
		}

    if(!(longest > shortest)) {
      longest = i32(Math.abs(height));
      shortest = i32(Math.abs(width));

      if(height < 0) {
				dy2 = -1;
			}
			else if(height > 0) {
				dy2 =  1;
			}

      dx2 = 0;
    }

    let numerator: i32 = i32(Math.floor(longest / 2));

		let xi: i32 = x1;
		let yi: i32 = y1;

    for(let index: i32 = 0; index <= longest; index += 1) {
      this.pixel(xi, yi, primaryColor, shaders);
      numerator += shortest;

      if(!(numerator < longest)) {
        numerator -= longest;
        xi += dx1;
        yi += dy1;
      }
			else {
        xi += dx2;
        yi += dy2;
      }
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
	public rectb(x: i32, y: i32, width: i32, height: i32, primaryColor: i32, shaders: PixelShader[] = []): this {
		this.hline(x, y, width, primaryColor, shaders);
		this.hline(x, y + height, width, primaryColor, shaders);
		this.vline(x, y + 1, height - 1, primaryColor, shaders);
		this.vline(x + width - 1, y + 1, height - 1, primaryColor, shaders);

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
	public rectf(x: i32, y: i32, width: i32, height: i32, primaryColor: i32, shaders: PixelShader[] = []): this {
		// Desenhar linhas...
		for(let index: i32 = 0; index < height; index += 1) {
			this.hline(x, y + index, width, primaryColor, shaders);
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
	public rect(x: i32, y: i32, width: i32, height: i32, primaryColor: i32, secondaryColor: i32, shaders: PixelShader[] = []): this {
		this.rectb(x, y, width, height, primaryColor, shaders);
		this.rectf(x + 1, y + 1, width - 2, height - 2, secondaryColor, shaders);

		return this;
	}

	/**
	 * Desenha um *bitmap* (recortado).
	 * 
	 * @param drawable *Bitmap*.
	 * @param x Posição X.
	 * @param y Posição Y.
	 * @param cx Posição X de recorte.
	 * @param cy Posição Y de recorte.
	 * @param width Largura.
	 * @param height Altura.
	 * @param scaleX Escala/inverte a imagem horizontalmente. Os valores são convertidos para inteiros.
	 * @param scaleY Escala/inverte a imagem verticalmente. Os valores são convertidos para inteiros.
	 * @param rotation (*não implementado*) Rotação da imagem.
	 * @param shaders *Pixel shaders*.
	 * 
	 * @returns {this}
	 */
	public blitsub(drawable: Drawable, x: i32, y: i32, cx: i32, cy: i32, width: i32, height: i32, scaleX: i32 = 1, scaleY: i32 = 1, rotation: i32 = 0, shaders: PixelShader[] = []): this {
		// A escala precisa ser um valor diferente de zero para funcionar.
		// Do contrário, a operação será encerrada.
		if(scaleX === 0 || scaleY === 0) {
			return this;
		}

		/** Inverter horizontalmente. */
		const mirrored: bool = scaleX < 0? true: false;

		/** Inverter verticalmente. */
		const flipped: bool = scaleY < 0? true: false;

		/** *Offset* horizontal do *pixel*. */
		const fx: i32 = mirrored?
			i32(Math.floor(scaleX))
		: i32(Math.ceil(scaleX));

		/** *Offset* vertical do *pixel*. */
		const fy: i32 = i32(flipped?
			i32(Math.floor(scaleY))
		: i32(Math.ceil(scaleY)));

		/** Largura do *pixel*. */
		const pw: i32 = i32(Math.abs(fx));

		/** Altura do *pixel*. */
		const ph: i32 = i32(Math.abs(fy));

		// Dependendo da escala vertical, a coluna será redesenhada
		// várias veze sob offsets diferentes...
		for(let pyi: i32 = 0; pyi < ph; pyi += 1) {
			
			// Percorrer linhas da imagem...
			for(let dy: i32 = 0; dy < height; dy += 1) {

				// Dependendo da escala horizontal, a linha será redesenhada 
				// várias vezes sob offsets diferentes...
				for(let pxi: i32 = 0; pxi < pw; pxi += 1) {
					// Percorrer colunas da imagem...
					for(let dx: i32 = 0; dx < width; dx += 1) {
						const pixel: i32 = drawable.getPixel(dx + cx, dy + cy);

						/** Posição X calculada do *pixel*. */
						const px: i32 = mirrored?
							(width - 1) - (x + dx)
						: x + dx;

						/** Posição Y calculada do *pixel*. */
						const py: i32 = flipped?
							(height - 1) - (y + dy)
						: y + dy;

						// Desenhar pixel...
						this.pixel(
							px + ((pw - 1) * dx) + pxi, 
							py + ((ph - 1) * dy) + pyi, 
							pixel, 
							shaders
						);
					}
				}
			}
		}

		return this;
	}

	/**
	 * Desenha um *bitmap* (completo).
	 * 
	 * @param drawable *Bitmap*.
	 * @param x Posição X.
	 * @param y Posição Y.
	 * @param scaleX Escala/inverte a imagem horizontalmente. Os valores são convertidos para inteiros.
	 * @param scaleY Escala/inverte a imagem verticalmente. Os valores são convertidos para inteiros.
	 * @param rotation (*não implementado*) Rotação da imagem.
	 * @param shaders *Pixel shaders*.
	 * 
	 * @returns {this}
	 */
	public blit(drawable: Drawable, x: i32, y: i32, scaleX: i32 = 1, scaleY: i32 = 1, rotation: i32 = 0, shaders: PixelShader[] = []): this {
		this.blitsub(drawable, x, y, 0, 0, drawable.width, drawable.height, scaleX, scaleY, rotation, shaders);
		return this;
	}

	/**
	 * Escreve um texto, utilizando um *bitmap* como fonte.
	 * 
	 * @param drawable *Bitmap*.
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
	 * @param rotation (*não implementado*) Rotação da imagem.
	 * @param shaders *Pixel shaders*.
	 * 
	 * @returns {this}
	 */
	public text(drawable: Drawable, x: i32, y: i32, cx: i32, cy: i32, width: i32, height: i32, charset: string, charColumns: i32, text: string, letterSpacing: i32 = 0, lineHeight: i32 = 0, scaleX: i32 = 1, scaleY: i32 = 1, rotation: i32 = 0, shaders: PixelShader[] = []): this {
		// Posições do texto.
		let line: i32 = 0;
		let column: i32 = 0;

		// Percorrer caracteres do texto...
		for(let index: i32 = 0; index < text.length; index += 1) {
			const char: string = text.charAt(index);
			const charIndex: i32 = charset.indexOf(char);

			// Quebrar linhas...
			if(char === "\n") {
				line += 1;
				column = 0;
				continue;
			}

			// Ignorar espaços e/ou caracteres que não existirem no charset...
			if(charIndex < 0) {
				column += 1;
				continue;
			}

			// Obter posição do caractere na imagem...
			const charRow: i32 = Math.floor(charIndex / charColumns) % charColumns;
			const charColumn: i32 = charIndex % charColumns;

			// Calcular valores de recorte...
			const charX: i32 = x + (column * width) + (letterSpacing * column);
			const charY: i32 = y + (line * height) + (lineHeight * line);
			const charCutX: i32 = cx + (charColumn *  width);
			const charCutY: i32 = cy + (charRow * height);

			// Desenhar caractere...
			this.blitsub(
				drawable,
				charX,
				charY,
				charCutX,
				charCutY,
				width,
				height,
				scaleX,
				scaleY,
				rotation,
				shaders
			);

			// Avançar para a próxima coluna...
			column += 1;
		}

		return this;
	}
}

//#endregion </surface.ts>
//#region <presets.ts>
/**
 * @class MaskShader @implements PixelShader
 * 
 * @description
 * *Pixel shader* usado para aplicar máscara de transparência.
 */
export class MaskShader implements PixelShader {
	/** Índice de transparência. */
	public value: number;

	/**
	 * @constructor
	 * 
	 * @param value Índice de transparência.
	 */
	public constructor(value: number = -1) {
		this.value = value;
	}

	public pixelShader(_previous: Pixel, next: Pixel): Pixel {
		// Descartar índice de cor da paleta quando este for igual ao valor 
		// definido pela máscara...
		if(next.color === this.value) {
			next.color = -1;
		}

		return next;
	}
}

/**
 * Paleta de cores padrão para uso.
 * 
 * *2bit demichrome Palette*.
 * (paleta de 4 cores, formato *RGBA*)
 * 
 * *Link:* {@link https://lospec.com/palette-list/2bit-demichrome}
 */
export const defaultPalette: Color[] = [
	new Color(0x21, 0x1e, 0x20, 0xff),
	new Color(0x55, 0x55, 0x68, 0xff),
	new Color(0xa0, 0xa0, 0x8b, 0xff),
	new Color(0xe9, 0xef, 0xec, 0xff),
];

//#endregion </presets.ts>
