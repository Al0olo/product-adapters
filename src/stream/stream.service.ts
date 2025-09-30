import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class StreamService {
  constructor(private eventEmitter: EventEmitter2) {}

  emitProductUpdate(product: any) {
    this.eventEmitter.emit('product.updated', product);
  }

  emitPriceChange(productId: string, oldPrice: number, newPrice: number) {
    this.eventEmitter.emit('price.changed', {
      productId,
      oldPrice,
      newPrice,
      timestamp: new Date(),
    });
  }
}
