/**
 * @name bitmap-js
 * @author MrRafael-dev
 * @license MIT
 * @version 1.0.9
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

//#region <color.ts>
/**
 * @class Color
 * 
 * @description
 * Representa uma cor no formato *RGBA*.
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
		for(let index: number = 0; index < bytes.length; index += 1) {
			const char: string = lowerValue.charAt(index + 1);

			// Ignorar identificador "#"...
			if(index === 0 && char === "#") {
				continue;
			}

			const charIndex: number = charset.indexOf(char);
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
	public constructor(r: number, g: number, b: number, a: number = 0) {
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
	public setValues(r: number, g: number, b: number, a: number): this {
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
	public x: number;

	/** Posição Y. */
	public y: number;

	/** Índice equivalente à cor da paleta. */
	public color: number;

	/**
	 * @constructor
	 * 
	 * @param x Posição X.
	 * @param y Posição Y.
	 * @param color Índice equivalente à cor da paleta.
	 */
	public constructor(x: number, y: number, color: number) {
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
	public setValues(x: number, y: number, color: number): this {
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
	width: number;

	/** Altura da imagem. */
	height: number;

	/** Dados da imagem. */
	data: Uint8Array;

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
	 * Obtém um *pixel* na posição especificada,
	 * ou um valor distinto, caso não exista.
	 * 
	 * @param x Posição X.
	 * @param y Posição Y.
	 * 
	 * @returns {number}
	 */
	getPixel(x: number, y: number): number;

	/**
	 * Limpa todo o conteúdo da imagem.
	 * 
	 * @param primaryColor Cor da paleta (primária).
	 * 
	 * @returns {boolean}
	 */
	clearImage(primaryColor: number): boolean;
}

//#endregion </drawable.ts>
//#region <bitmap.ts>
/**
 * @enum BitmapOffsets
 * 
 * @description
 * *Offsets* de metadados do *bitmap*.
 */
enum BitmapOffsets {
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

/**
 * @class Bitmap @implements Drawable
 * 
 * @description
 * Representa um *bitmap* descomprimido com
 * uma paleta de 256 cores (formato *8bpp*).
 */
export class Bitmap implements Drawable {
	/** Largura. */
	private _width: number;

	/** Altura. */
	private _height: number;

	/** Tamanho da área da imagem, em *pixels*. */
	private _size: number;

	/** Número de cores disponíveis na paleta. */
	private _paletteSize: number;

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
		if(file.byteLength < BitmapOffsets.HEADER_SIZE) {
			throw new Error("Supported bitmaps must have at least 1078 bytes or more to be accepted.");
		}

		/** Visualizador de dados do arquivo. */
		const fileView: DataView = new DataView(file.buffer);

		/** (Número mágico ("BM"). */
		const signature: number = fileView.getUint16(BitmapOffsets.HEADER_MAGIC, false);

		/** *Offset* dos ados da imagem. */
		const dataOffset: number = fileView.getUint32(BitmapOffsets.HEADER_DATA, true);

		/** Largura do *bitmap*, em *pixels*. */
		const width: number = fileView.getUint32(BitmapOffsets.HEADER_WIDTH, true);

		/** Altura do *bitmap*, em *pixels*. */
		const height: number = fileView.getUint32(BitmapOffsets.HEADER_HEIGHT, true);

		/** Formato de cores (*bits per pixel*). */
		const bitsPerPixel: number = fileView.getUint16(BitmapOffsets.HEADER_COLOR_FORMAT, true);

		/** Formato de compressão. */
		const compression: number = fileView.getUint16(BitmapOffsets.HEADER_COMPRESSION, true);
		
		// Bitmaps são identificados pelo número mágico 0x424D ("BM").
		// Formatos inválidos serão rejeitados.
		if(signature !== BitmapOffsets.HEADER_BM) {
			throw new Error("Invalid bitmap signature header. They must start with 0x424D (16973).");
		}

		// O formato de bitmap é tão específico que até o offset do início dos
		// dados de imagem precisam começar no lugar correto.
		if(dataOffset !== BitmapOffsets.HEADER_SIZE) {
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
		const fragment: Uint8Array = file.slice(BitmapOffsets.PALETTE_START, file.byteLength);

		result.data.set(fragment, BitmapOffsets.PALETTE_START);
		return result;
	}

	/**
	 * @constructor
	 * 
	 * @param width Largura.
	 * @param height Altura.
	 * @param colors Cores.
	 */
	public constructor(width: number, height: number, colors: Color[] = []) {
		// Bitmaps devem ter um tamanho pelo menos de 1x1.
		// Tamanhos inválidos serão rejeitados.
		if(width <= 0 || height <= 0) {
			throw new Error("Invalid bitmap size. Width and height must be at least 1 pixel each.");
		}

		/** Tamanho da área da imagem, em *pixels*. */
		const size: number = width * height;

		this._width = width;
		this._height = height;
		this._size = size;
		this._paletteSize = BitmapOffsets.PALETTE_SIZE;
		this._data = new Uint8Array(BitmapOffsets.HEADER_SIZE + size);

		/** Visualizador de dados da imagem. */
		const view: DataView = new DataView(this._data.buffer);
		
		// Inserir cabeçalho...
		this._data.set(defaultHeader, 0);

		// Escrever tamanho do arquivo e altura/largura da imagem...
		view.setUint32(BitmapOffsets.HEADER_FILESIZE, this._data.byteLength, true);
		view.setUint32(BitmapOffsets.HEADER_WIDTH, this.width, true);
		view.setUint32(BitmapOffsets.HEADER_HEIGHT, this.height, true);

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
	public toImageData(mask: number = -1): Uint8ClampedArray {
		/** Resultado a ser retornado. */
		const result: Uint8ClampedArray = new Uint8ClampedArray(this._size * 4);

		// Percorrer pixels da imagem...
		for(let y: number = 0; y < this._height; y += 1) {
			for(let x: number = 0; x < this._width; x += 1) {
				/** *Pixel*. */
				const pixel: number = this.getPixel(x, y);

				// Ignorar máscara de transparência...
				if(pixel === mask) {
					continue;
				}

				/** Cor da paleta equivalente ao *pixel* obtido. */
				const color: Color = this.getColor(pixel);

				/** Índice a ser alterado no resultado. */
				const index: number = ((this._width * y) + x) * 4;

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

	public get width(): number {
		return this._width;
	}

	public get height(): number {
		return this._height;
	}

	public get data(): Uint8Array {
		return this._data;
	}

	public setPixel(x: number, y: number, primaryColor: number): boolean {
		// A posição deve estar na área de desenho e
		// o índice deve estar entre o tamanho da paleta.
		// Do contrário, nada será feito.
		if(!this.withinImage(x, y) || !this.withinPalette(primaryColor)) {
			return false;
		}
		
		/** Posição X, convertida para número inteiro. */
		const px: number = x < 0? Math.floor(x): Math.ceil(x);

		/** Posição Y, convertida para número inteiro. */
		const py: number = y < 0? Math.floor(y): Math.ceil(y);

		/** Posição Y, invertida. */
		const iy: number = (this._height - 1) - py;

		/** *Offset* do *pixel*. */
		const offset: number = BitmapOffsets.HEADER_SIZE + (this._width * iy) + px;

		this._data[offset] = primaryColor;
		return true;
	}

	public getPixel(x: number, y: number): number {
		// A posição deve estar na área de desenho.
		// Do contrário, será retornado uma cor de paleta negativa.
		if(!this.withinImage(x, y)) {
			return -1;
		}

		/** Posição Y, invertida. */
		const iy: number = (this._height - 1) - y;

		/** *Offset* do *pixel*. */
		const offset: number = BitmapOffsets.HEADER_SIZE + (this._width * iy) + x;

		return this._data[offset];
	}

	public clearImage(primaryColor: number): boolean {
		this.data.fill(primaryColor, BitmapOffsets.HEADER_SIZE);
		return true;
	}

	/** Tamanho da área da imagem, em *pixels*. */
	public get size(): number {
		return this._size;
	}

	/** Número de cores disponíveis na paleta. */
	public get paletteSize(): number {
		return this._paletteSize;
	}

	/**
	 * Indica se uma determinada posição está dentro da área de desenho.
	 * 
	 * @param x Posição X.
	 * @param y Posição Y.
	 * 
	 * @returns {boolean}
	 */
	public withinImage(x: number, y: number): boolean {
		return x >= 0 && x < this._width && y >= 0 && y < this._height;
	}

	/**
	 * Indica se um determinado índice de cor está dentro da paleta de cores.
	 * 
	 * @param index Índice da paleta.
	 * 
	 * @returns {boolean}
	 */
	public withinPalette(index: number): boolean {
		return index >= 0 && index < this._paletteSize;
	}

	/**
	 * Define uma cor da paleta no índice especificado.
	 * 
	 * @param index Índice da paleta.
	 * @param color Cor.
	 * 
	 * @returns {boolean}
	 */
	public setColor(index: number, color: Color): boolean {
		// O índice deve estar entre o tamanho da paleta.
		// Do contrário, nada será feito.
		if(!this.withinPalette(index)) {
			return false;
		}

		/** *Offset* da paleta. */
		const offset: number = BitmapOffsets.PALETTE_START + (index * 4);

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
	public getColor(index: number): Color {
		// O índice deve estar entre o tamanho da paleta.
		// Do contrário, será retornada uma cor padrão.
		if(!this.withinPalette(index)) {
			return new Color(0, 0, 0, 0);
		}

		/** *Offset* da paleta. */
		const offset: number = BitmapOffsets.PALETTE_START + (index * 4);

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
	 * @returns {boolean}
	 */
	public setPalette(colors: Color[]): boolean {
		/** Resultado final. */
		let result: boolean = true;

		for(let index: number = 0; index < colors.length; index += 1) {
			const color: Color = colors[index];
			const colorResult: boolean = this.setColor(index, color);

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
		for(let index: number = 0; index < this._paletteSize; index += 1) {
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
	public getPixelColor(x: number, y: number): Color {
		const index: number = this.getPixel(x, y);
		const color: Color =  this.getColor(index);

		return color;
	}
}

//#endregion </bitmap.ts>
//#region <rendering_context.ts>
/**
 * @interface RenderingContext
 * 
 * Estrutura representativa de um contexto de renderização.
 * 
 * Um contexto de renderização declara diversas funcionalidades básicas
 * de desenho disponíveis para uso.
 */
export interface RenderingContext<T> {
	/** Elemento de desenho. */
	target: T;

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
	pixel(x: number, y: number, primaryColor: number, shaders: PixelShader[]): this;

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
	hline(x: number, y: number, size: number, primaryColor: number, shaders: PixelShader[]): this;

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
	vline(x: number, y: number, size: number, primaryColor: number, shaders: PixelShader[]): this;

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
	rectb(x: number, y: number, width: number, height: number, primaryColor: number, shaders: PixelShader[]): this;

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
	rectf(x: number, y: number, width: number, height: number, primaryColor: number, shaders: PixelShader[]): this;

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
	rect(x: number, y: number, width: number, height: number, primaryColor: number, secondaryColor: number, shaders: PixelShader[]): this;

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
	blitsub(drawable: Drawable, x: number, y: number, cx: number, cy: number, width: number, height: number, scaleX: number, scaleY: number, rotation: number, shaders: PixelShader[]): this;

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
	blit(drawable: Drawable, x: number, y: number, scaleX: number, scaleY: number, rotation: number, shaders: PixelShader[]): this;

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
	text(drawable: Drawable, x: number, y: number, cx: number, cy: number, width: number, height: number, charset: string, charColumns: number, text: string, letterSpacing: number, lineHeight: number, scaleX: number, scaleY: number, rotation: number, shaders: PixelShader[]): this;
}

//#endregion </rendering_context.ts>
//#region <surface.ts>
/**
 * @class Surface
 * 
 * @description
 * Representa uma camada de abstração para um *bitmap*.
 * Com uma *surface*, é possível realizar uma série de operações básicas
 * de desenho, como linhas, retângulos e outros *bitmaps*.
 */
export class Surface<T extends Drawable> implements RenderingContext<T> {
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

	public get target(): T {
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
	public pixel(x: number, y: number, primaryColor: number, shaders: PixelShader[] = []): this {
		/** *Pixel* original. */
		let previous: Pixel = new Pixel(x, y, this._drawable.getPixel(x, y));

		/** Novo *pixel*. */
		let next: Pixel = new Pixel(x, y, primaryColor);

		// Aplicar pixel shaders...
		for(let index: number = 0; index < shaders.length; index += 1) {
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
	public clear(primaryColor: number): this {
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
	public hline(x: number, y: number, size: number, primaryColor: number, shaders: PixelShader[] = []): this {
		// Desenhar pixels...
		for(let index: number = 0; index < size; index += 1) {
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
	public vline(x: number, y: number, size: number, primaryColor: number, shaders: PixelShader[] = []): this {
		// Desenhar pixels...
		for(let index: number = 0; index < size; index += 1) {
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
	public rectb(x: number, y: number, width: number, height: number, primaryColor: number, shaders: PixelShader[] = []): this {
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
	public rectf(x: number, y: number, width: number, height: number, primaryColor: number, shaders: PixelShader[] = []): this {
		// Desenhar linhas...
		for(let index: number = 0; index < height; index += 1) {
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
	public rect(x: number, y: number, width: number, height: number, primaryColor: number, secondaryColor: number, shaders: PixelShader[] = []): this {
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
	public blitsub(drawable: Drawable, x: number, y: number, cx: number, cy: number, width: number, height: number, scaleX: number = 1, scaleY: number = 1, rotation: number = 0, shaders: PixelShader[] = []): this {
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
		const fx: number = mirrored?
			Math.floor(scaleX)
		: Math.ceil(scaleX);

		/** *Offset* vertical do *pixel*. */
		const fy: number = flipped?
			Math.floor(scaleY)
		: Math.ceil(scaleY);

		/** Largura do *pixel*. */
		const pw: number = Math.abs(fx);

		/** Altura do *pixel*. */
		const ph: number = Math.abs(fy);

		// Dependendo da escala vertical, a coluna será redesenhada
		// várias veze sob offsets diferentes...
		for(let pyi: number = 0; pyi < ph; pyi += 1) {
			
			// Percorrer linhas da imagem...
			for(let dy: number = 0; dy < height; dy += 1) {

				// Dependendo da escala horizontal, a linha será redesenhada 
				// várias vezes sob offsets diferentes...
				for(let pxi: number = 0; pxi < pw; pxi += 1) {
					// Percorrer colunas da imagem...
					for(let dx: number = 0; dx < width; dx += 1) {
						const pixel: number = drawable.getPixel(dx + cx, dy + cy);

						/** Posição X calculada do *pixel*. */
						const px: number = mirrored?
							(width - 1) - (x + dx)
						: x + dx;

						/** Posição Y calculada do *pixel*. */
						const py: number = flipped?
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
	public blit(drawable: Drawable, x: number, y: number, scaleX: number = 1, scaleY: number = 1, rotation: number = 0, shaders: PixelShader[] = []): this {
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
	public text(drawable: Drawable, x: number, y: number, cx: number, cy: number, width: number, height: number, charset: string, charColumns: number, text: string, letterSpacing: number = 0, lineHeight: number = 0, scaleX: number = 1, scaleY: number = 1, rotation: number = 0, shaders: PixelShader[] = []): this {
		// Posições do texto.
		let line: number = 0;
		let column: number = 0;

		// Percorrer caracteres do texto...
		for(let index: number = 0; index < text.length; index += 1) {
			const char: string = text.charAt(index);
			const charIndex: number = charset.indexOf(char);

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
			const charRow: number = Math.floor(charIndex / charColumns) % charColumns;
			const charColumn: number = charIndex % charColumns;

			// Calcular valores de recorte...
			const charX: number = x + (column * width) + (letterSpacing * column);
			const charY: number = y + (line * height) + (lineHeight * line);
			const charCutX: number = cx + (charColumn *  width);
			const charCutY: number = cy + (charRow * height);

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
