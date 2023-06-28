import {Injectable, NestMiddleware} from "@nestjs/common";

// @Injectable()
// export class PaginationMiddleware implements NestMiddleware {
//     use(req: any, res: any, next: () => void) {
//         req.query.pageNumber = +req.query.pageNumber || 1;
//         req.query.pageSize = +req.query.pageSize || 10;
//         req.query.sortBy = req.query.sortBy || 'createdAt',
//         req.query.sortDirection = req.query.sortDirection === 'desc' ? -1 : 1
//             next();
//     }
// }