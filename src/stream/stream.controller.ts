import { Controller, Get, Res, Sse, Version } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type { Response } from 'express';
import { Observable, interval, map } from 'rxjs';
import { StreamService } from './stream.service';

@ApiTags('stream')
@Controller('stream')
export class StreamController {
  constructor(private streamService: StreamService) {}

  @Get('products')
  @Sse('products')
  @Version('1')
  @ApiOperation({ summary: 'Server-Sent Events stream for product updates' })
  streamProducts(@Res() res: Response): Observable<{ data: string }> {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    return interval(5000).pipe(
      map(() => ({
        data: JSON.stringify({
          message: 'Product update stream active',
          timestamp: new Date().toISOString(),
        }),
      })),
    );
  }
}
