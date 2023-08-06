/**
 * @name bitmap-js
 * @author MrRafael-dev
 * @license MIT
 * @version 1.0.7
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

//#region <constants.ts>
/** Tamanho do cabeçalho (incluindo paleta). */
const HEADER_SIZE: i32 = 1078;

/** Número mágico ("BM"). */
const HEADER_BM: u16 = 0x424D;

/** (*Offset*) Número mágico ("BM"). */
const HEADER_MAGIC: i32 = 0;

/** (*Offset*) *Offset* dos ados da imagem. */
const HEADER_DATA: i32 = 10;

/** (*Offset*) Tamanho do arquivo, em *bytes*. */
const HEADER_FILESIZE: i32 = 2;

/** (*Offset*) Largura do *bitmap*, em *pixels*. */
const HEADER_WIDTH: i32 = 18;

/** (*Offset*) Altura do *bitmap*, em *pixels*. */
const HEADER_HEIGHT: i32 = 22;

/** (*Offset*) Formato de cores (*bits per pixel*). */
const HEADER_COLOR_FORMAT: i32 = 28;

/** (*Offset*) Formato de compressão. */
const HEADER_COMPRESSION: i32 = 30;

/** Número de cores da paleta. */
const PALETTE_SIZE: i32 = 256;

/** (*Offset*) Posição da paleta de cores. */
const PALETTE_START: i32 = 54;

/**
 * Cabeçalho padrão.
 *
 * Assume-se um *bitmap* descomprimido com
 * uma paleta de 256 cores (formato *8bpp*).
 */
const defaultHeader: Uint8Array = new Uint8Array(54);
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
	width: u16;

	/** Altura da imagem. */
	height: u16;

	/** Tamanho da área da imagem, em *pixels*. */
	size: u32;

	/** Número de cores disponíveis na paleta. */
	paletteSize: u32;

	/** Dados da imagem. */
	data: Uint8Array;

	/**
	 * Indica se uma determinada posição está dentro da área de desenho.
	 * 
	 * @param x Posição X.
	 * @param y Posição Y.
	 * 
	 * @returns {boolean}
	 */
	withinImage(x: i32, y: i32): boolean;

	/**
	 * Indica se um determinado índice de cor está dentro da paleta de cores.
	 * 
	 * @param index Índice da paleta.
	 * 
	 * @returns {boolean}
	 */
	withinPalette(index: i32): boolean;

	/**
	 * Define uma cor da paleta no índice especificado.
	 * 
	 * @param index Índice da paleta.
	 * @param color Cor.
	 * 
	 * @returns {boolean}
	 */
	setColor(index: i32, color: Color): boolean;

	/**
	 * Obtém uma cópia da cor da paleta no índice especificado.
	 * Retorna uma cor `#000000` quando não existe.
	 * 
	 * @param index Índice da paleta.
	 * 
	 * @returns {Color}
	 */
	getColor(index: i32): Color;

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
	 * Obtém um *pixel* na posição especificada.
	 * Retorna a cor de paleta `-1` quando não existe.
	 * 
	 * @param x Posição X.
	 * @param y Posição Y.
	 * 
	 * @returns {number}
	 */
	setPixel(x: i32, y: i32, primaryColor: i32): boolean;

	/**
	 * Define um *pixel* na posição especificada.
	 * 
	 * @param x Posição X.
	 * @param y Posição Y.
	 * @param primaryColor Cor da paleta (primária).
	 * 
	 * @returns {boolean}
	 */
	getPixel(x: i32, y: i32): i32;

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
	getPixelColor(x: i32, y: i32): Color;

	/**
	 * Limpa todo o conteúdo da imagem.
	 * 
	 * @param primaryColor Cor da paleta (primária).
	 * 
	 * @returns {boolean}
	 */
	clearImage(primaryColor: i32): boolean;
}

//#endregion </drawable.ts>
//#region <bitmap.ts>
/**
 * @class Bitmap @implements Drawable
 * 
 * @description
 * Representa um *bitmap* descomprimido com
 * uma paleta de 256 cores (formato *8bpp*).
 */
export class Bitmap implements Drawable {
	/** Largura. */
	private _width: u16;

	/** Altura. */
	private _height: u16;

	/** Tamanho da área da imagem, em *pixels*. */
	private _size: u32;

	/** Número de cores disponíveis na paleta. */
	private _paletteSize: u32;

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
		if(file.byteLength < HEADER_SIZE) {
			throw new Error("Supported bitmaps must have at least 1078 bytes or more to be accepted.");
		}

		/** Visualizador de dados do arquivo. */
		const fileView: DataView = new DataView(file.buffer);

		/** (Número mágico ("BM"). */
		const signature: u16 = fileView.getUint16(HEADER_MAGIC, false);

		/** *Offset* dos ados da imagem. */
		const dataOffset: u32 = fileView.getUint32(HEADER_DATA, true);

		/** Largura do *bitmap*, em *pixels*. */
		const width: u16 = fileView.getUint32(HEADER_WIDTH, true) as u16;

		/** Altura do *bitmap*, em *pixels*. */
		const height: u16 = fileView.getUint32(HEADER_HEIGHT, true) as u16;

		/** Formato de cores (*bits per pixel*). */
		const bitsPerPixel: u16 = fileView.getUint16(HEADER_COLOR_FORMAT, true);

		/** Formato de compressão. */
		const compression: u16 = fileView.getUint16(HEADER_COMPRESSION, true);
		
		// Bitmaps são identificados pelo número mágico 0x424D ("BM").
		// Formatos inválidos serão rejeitados.
		if(signature !== HEADER_BM) {
			throw new Error("Invalid bitmap signature header. They must start with 0x424D (16973).");
		}

		// O formato de bitmap é tão específico que até o offset do início dos
		// dados de imagem precisam começar no lugar correto.
		if(dataOffset !== HEADER_SIZE) {
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
		const fragment: Uint8Array = file.slice(PALETTE_START, file.byteLength);

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
	public constructor(width: u16, height: u16, colors: Color[] = []) {
		// Bitmaps devem ter um tamanho pelo menos de 1x1.
		// Tamanhos inválidos serão rejeitados.
		if(width <= 0 || height <= 0) {
			throw new Error("Invalid bitmap size. Width and height must be at least 1 pixel each.");
		}

		/** Tamanho da área da imagem, em *pixels*. */
		const size: u32 = (width * height) as u32;

		this._width = width;
		this._height = height;
		this._size = size;
		this._paletteSize = PALETTE_SIZE;
		this._data = new Uint8Array(HEADER_SIZE + size);

		/** Visualizador de dados da imagem. */
		const view: DataView = new DataView(this._data.buffer);
		
		// Inserir cabeçalho...
		this._data.set(defaultHeader, 0);

		// Escrever tamanho do arquivo e altura/largura da imagem...
		view.setUint32(HEADER_FILESIZE, this._data.byteLength, true);
		view.setUint32(HEADER_WIDTH, this.width, true);
		view.setUint32(HEADER_HEIGHT, this.height, true);

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
		for(let y: i32 = 0; y < (this._height as i32); y += 1) {
			for(let x: i32 = 0; x < (this._width as i32); x += 1) {
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

	public get width(): u16 {
		return this._width;
	}

	public get height(): u16 {
		return this._height;
	}

	public get size(): u32 {
		return this._size;
	}

	public get paletteSize(): u32 {
		return this._paletteSize;
	}

	public get data(): Uint8Array {
		return this._data;
	}

	public withinImage(x: i32, y: i32): boolean {
		return x >= 0 && x < (this._width as i32) && y >= 0 && y < (this._height as i32);
	}

	public withinPalette(index: i32): boolean {
		return index >= 0 && (index as u32) < this._paletteSize;
	}

	public setColor(index: i32, color: Color): boolean {
		// O índice deve estar entre o tamanho da paleta.
		// Do contrário, nada será feito.
		if(!this.withinPalette(index)) {
			return false;
		}

		/** *Offset* da paleta. */
		const offset: i32 = PALETTE_START + (index * 4);

		// Escrever a nova cor...
		this._data[offset] = color.b;
		this._data[offset + 1] = color.g;
		this._data[offset + 2] = color.r;
		this._data[offset + 3] = color.a;

		return true;
	}

	public getColor(index: i32): Color {
		// O índice deve estar entre o tamanho da paleta.
		// Do contrário, será retornada uma cor padrão.
		if(!this.withinPalette(index)) {
			return new Color(0, 0, 0, 0);
		}

		/** *Offset* da paleta. */
		const offset: i32 = PALETTE_START + (index * 4);

		return new Color(
			this._data[offset + 2],
			this._data[offset + 1],
			this._data[offset],
			this._data[offset + 3]
		);
	}

	public setPalette(colors: Color[]): boolean {
		/** Resultado final. */
		let result: boolean = true;

		for(let index: i32 = 0; index < colors.length; index += 1) {
			const color: Color = colors[index];
			const colorResult: boolean = this.setColor(index, color);

			// Sinalizar resultado final, caso necessário...
			if(!colorResult) {
				result = false;
			}

			// Não exceder o tamanho da paleta...
			if(index as u32 >= this._paletteSize) {
				break;
			}
		}

		return result;
	}

	public getPalette(): Color[] {
		/** Resultado. */
		const result: Color[] = [];

		// Percorrer cores da paleta...
		for(let index: i32 = 0; index < (this._paletteSize as i32); index += 1) {
			const color: Color = this.getColor(index);
			result.push(color);
		}

		return result;
	}

	public setPixel(x: i32, y: i32, primaryColor: i32): boolean {
		// A posição deve estar na área de desenho e
		// o índice deve estar entre o tamanho da paleta.
		// Do contrário, nada será feito.
		if(!this.withinImage(x, y) || !this.withinPalette(primaryColor)) {
			return false;
		}

		/** Posição Y, invertida. */
		const iy: i32 = (this._height - 1) - y;

		/** *Offset* do *pixel*. */
		const offset: i32 = HEADER_SIZE + (this._width * iy) + x;

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
		const offset: i32 = HEADER_SIZE + (this._width * iy) + x;

		return this._data[offset];
	}

	public getPixelColor(x: i32, y: i32): Color {
		const index: i32 = this.getPixel(x, y);
		const color: Color =  this.getColor(index);

		return color;
	}

	public clearImage(primaryColor: i32): boolean {
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
	constructor(drawable: T) {
		this._drawable = drawable;
	}

	get drawable(): T {
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
		this.rectf(x + 1, y + 1, width - 1, height - 1, secondaryColor, shaders);

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
		const mirrored: boolean = scaleX < 0? true: false;

		/** Inverter verticalmente. */
		const flipped: boolean = scaleY < 0? true: false;

		/** *Offset* horizontal do *pixel*. */
		const fx: f64 = mirrored?
			Math.floor(scaleX)
		: Math.ceil(scaleX);

		/** *Offset* vertical do *pixel*. */
		const fy: f64 = flipped?
			Math.floor(scaleY)
		: Math.ceil(scaleY);

		/** Largura do *pixel*. */
		const pw: i32 = Math.abs(fx) as i32;

		/** Altura do *pixel*. */
		const ph: i32 = Math.abs(fy) as i32;

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
			const charRow: i32 = (charIndex / charColumns) % charColumns;
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