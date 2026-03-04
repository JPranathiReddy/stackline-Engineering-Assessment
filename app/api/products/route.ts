import { NextRequest, NextResponse } from 'next/server';
import { productService, SortBy } from '@/lib/products';

const VALID_SORTS: SortBy[] = ["default", "price-asc", "price-desc", "name-asc", "name-desc"];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sortParam = searchParams.get('sortBy') as SortBy;

  const filters = {
    category: searchParams.get('category') || undefined,
    subCategory: searchParams.get('subCategory') || undefined,
    search: searchParams.get('search') || undefined,
    sortBy: VALID_SORTS.includes(sortParam) ? sortParam : undefined,
    limit: Math.min(Math.max(1, parseInt(searchParams.get('limit') || '20') || 20), 100),
    offset: Math.max(0, parseInt(searchParams.get('offset') || '0') || 0),
  };

  const products = productService.getAll(filters);
  const total = productService.getTotalCount({
    category: filters.category,
    subCategory: filters.subCategory,
    search: filters.search,
  });

  return NextResponse.json({
    products,
    total,
    limit: filters.limit,
    offset: filters.offset,
  });
}
