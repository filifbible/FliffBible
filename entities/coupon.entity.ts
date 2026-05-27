export class CouponEntity {
  constructor(
    public id: string,
    public code: string,
    public discountPercent: number,
    public maxUses: number,       // 0 = unlimited
    public timesUsed: number,
    public active: boolean,
    public createdBy?: string
  ) {}

  /**
   * Verifica se o cupom pode ser utilizado.
   * Regras: deve estar ativo e, se tiver limite de usos, não pode ter excedido.
   */
  canBeUsed(): boolean {
    if (!this.active) return false;
    if (this.maxUses > 0 && this.timesUsed >= this.maxUses) return false;
    return true;
  }

  /**
   * Calcula o valor final após aplicar o desconto do cupom.
   * @param originalPrice Preço original do plano
   * @returns Preço com desconto, arredondado para 2 casas decimais
   */
  applyDiscount(originalPrice: number): number {
    if (!this.canBeUsed()) return originalPrice;
    return Number((originalPrice * (1 - this.discountPercent / 100)).toFixed(2));
  }

  /**
   * Retorna o valor economizado com o cupom.
   */
  savingsAmount(originalPrice: number): number {
    return Number((originalPrice - this.applyDiscount(originalPrice)).toFixed(2));
  }

  /**
   * Quantos usos restam. Retorna Infinity se for uso ilimitado.
   */
  remainingUses(): number {
    if (this.maxUses === 0) return Infinity;
    return Math.max(0, this.maxUses - this.timesUsed);
  }
}
