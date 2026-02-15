import { getCategoryColor } from '@/lib/constants';

export default function CategoryBadge({ category }) {
    const color = getCategoryColor(category);

    return (
        <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap"
            style={{
                background: `${color}15`,
                color: color,
            }}
        >
            {category}
        </span>
    );
}
