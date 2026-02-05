"""
Admin PDF report extension
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.enums import TA_CENTER
from datetime import datetime
from typing import List, Dict, Any
import tempfile


def generate_admin_report_extended(stats: Dict[str, Any], orders: List[Any], products: List[Any], font_name: str, font_bold: str) -> str:
    """Generate comprehensive admin report"""
    
    # Create temporary file
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
    pdf_path = temp_file.name
    temp_file.close()
    
    # Create PDF document
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm
    )
    
    # Container for PDF elements
    elements = []
    
    # Styles
    from reportlab.lib.styles import getSampleStyleSheet
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=26,
        fontName=font_bold,
        textColor=colors.HexColor('#7c3aed'),
        spaceAfter=30,
        alignment=TA_CENTER
    )
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        fontName=font_bold,
        textColor=colors.HexColor('#7c3aed'),
        spaceAfter=12,
        spaceBefore=12
    )
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontName=font_name,
        fontSize=10
    )
    
    # Title
    title = Paragraph("👑 ОТЧЁТ АДМИНИСТРАТОРА ПЛАТФОРМЫ BIBARYS", title_style)
    elements.append(title)
    
    # Date
    date_text = Paragraph(
        f"Дата создания: {datetime.now().strftime('%d.%m.%Y %H:%M')}",
        normal_style
    )
    elements.append(date_text)
    elements.append(Spacer(1, 1*cm))
    
    # Main Statistics Section
    elements.append(Paragraph("📊 ОБЩАЯ СТАТИСТИКА ПЛАТФОРМЫ", heading_style))
    
    main_stats_data = [
        ['Показатель', 'Значение'],
        ['👥 Всего пользователей', f"{stats.get('total_users', 0):,}"],
        ['✅ Активных пользователей', f"{stats.get('active_users', 0):,}"],
        ['📦 Всего товаров', f"{stats.get('total_products', 0):,}"],
        ['🟢 Активных товаров', f"{stats.get('active_products', 0):,}"],
        ['🛒 Всего заказов', f"{stats.get('total_orders', 0):,}"],
        ['⏳ Ожидающих заказов', f"{stats.get('pending_orders', 0):,}"],
        ['💰 Общая выручка', f"{stats.get('total_revenue', 0):,.0f} ₸"],
    ]
    
    main_stats_table = Table(main_stats_data, colWidths=[10*cm, 7*cm])
    main_stats_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#7c3aed')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), font_bold),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.lavender),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('FONTNAME', (0, 1), (-1, -1), font_name),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
    ]))
    
    elements.append(main_stats_table)
    elements.append(Spacer(1, 0.8*cm))
    
    # User Statistics
    elements.append(Paragraph("👥 СТАТИСТИКА ПОЛЬЗОВАТЕЛЕЙ", heading_style))
    
    user_stats_data = [
        ['Тип пользователя', 'Всего', 'Активных'],
        ['🛍️ Покупатели', 
         f"{stats.get('total_customers', 0):,}",
         f"{stats.get('active_customers', 0):,}"],
        ['💼 Продавцы', 
         f"{stats.get('total_sellers', 0):,}",
         f"{stats.get('active_sellers_count', 0):,}"],
    ]
    
    user_stats_table = Table(user_stats_data, colWidths=[8*cm, 4.5*cm, 4.5*cm])
    user_stats_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#7c3aed')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), font_bold),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('FONTNAME', (0, 1), (-1, -1), font_name),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
    ]))
    
    elements.append(user_stats_table)
    elements.append(Spacer(1, 0.8*cm))
    
    # Category Statistics
    if stats.get('category_stats'):
        elements.append(Paragraph("📁 СТАТИСТИКА ПО КАТЕГОРИЯМ", heading_style))
        
        category_data = [['Категория', 'Товаров', 'Остаток']]
        category_names = {
            'dairy': 'Молочные продукты',
            'bakery': 'Хлебобулочные',
            'beverages': 'Напитки',
            'meat': 'Мясо и птица',
            'fruits_vegetables': 'Фрукты и овощи',
            'frozen': 'Замороженные',
            'grocery': 'Бакалея',
            'sweets': 'Сладости',
            'canned': 'Консервы',
            'other': 'Прочее'
        }
        
        for cat in stats['category_stats'][:10]:
            category_data.append([
                category_names.get(cat['category'], cat['category']),
                f"{cat['count']:,}",
                f"{int(cat['total_stock']):,}"
            ])
        
        category_table = Table(category_data, colWidths=[9*cm, 4*cm, 4*cm])
        category_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#7c3aed')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), font_bold),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTNAME', (0, 1), (-1, -1), font_name),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
        ]))
        
        elements.append(category_table)
        elements.append(Spacer(1, 0.8*cm))
    
    # Top Sellers
    if stats.get('top_sellers'):
        elements.append(Paragraph("🏆 ТОП-10 ПРОДАВЦОВ", heading_style))
        
        sellers_data = [['#', 'Имя', 'Email', 'Товаров', 'Просмотры']]
        for idx, seller in enumerate(stats['top_sellers'][:10], 1):
            sellers_data.append([
                str(idx),
                seller['name'][:30],
                seller['email'][:35],
                f"{seller['products_count']:,}",
                f"{seller['total_views']:,}"
            ])
        
        sellers_table = Table(sellers_data, colWidths=[1*cm, 5*cm, 6*cm, 2.5*cm, 2.5*cm])
        sellers_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#7c3aed')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), font_bold),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTNAME', (0, 1), (-1, -1), font_name),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
        ]))
        
        elements.append(sellers_table)
        elements.append(Spacer(1, 0.8*cm))
    
    # Top Customers
    if stats.get('top_customers'):
        elements.append(Paragraph("💎 ТОП-10 ПОКУПАТЕЛЕЙ", heading_style))
        
        customers_data = [['#', 'Имя', 'Email', 'Заказов', 'Потрачено']]
        for idx, customer in enumerate(stats['top_customers'][:10], 1):
            customers_data.append([
                str(idx),
                customer['name'][:30],
                customer['email'][:35],
                f"{customer['orders_count']:,}",
                f"{customer['total_spent']:,.0f} ₸"
            ])
        
        customers_table = Table(customers_data, colWidths=[1*cm, 5*cm, 6*cm, 2.5*cm, 2.5*cm])
        customers_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#7c3aed')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), font_bold),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTNAME', (0, 1), (-1, -1), font_name),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
        ]))
        
        elements.append(customers_table)
        elements.append(Spacer(1, 0.8*cm))
    
    # Recent Orders Section
    if orders:
        elements.append(Paragraph("📋 ПОСЛЕДНИЕ ЗАКАЗЫ", heading_style))
        
        orders_data = [['№', 'Покупатель', 'Сумма', 'Статус']]
        for order in orders[:15]:
            user_email = order.user.email if hasattr(order, 'user') and order.user else 'N/A'
            status_labels = {
                'pending': 'Ожидает',
                'processing': 'В обработке',
                'shipped': 'Отправлен',
                'delivered': 'Доставлен',
                'cancelled': 'Отменён'
            }
            status = status_labels.get(order.status, order.status)
            
            orders_data.append([
                f"#{order.id}",
                user_email[:30],
                f"{order.total_price:,.0f} ₸",
                status
            ])
        
        orders_table = Table(orders_data, colWidths=[2*cm, 7*cm, 4*cm, 4*cm])
        orders_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#7c3aed')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), font_bold),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTNAME', (0, 1), (-1, -1), font_name),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
        ]))
        
        elements.append(orders_table)
        elements.append(Spacer(1, 0.8*cm))
    
    # Top Products Section
    if products:
        elements.append(Paragraph("⭐ ТОП ТОВАРЫ ПО РЕЙТИНГУ", heading_style))
        
        products_data = [['ID', 'Название', 'Цена', 'Рейтинг', 'Отзывы']]
        for product in products[:15]:
            products_data.append([
                str(product.id),
                product.name[:45] + ('...' if len(product.name) > 45 else ''),
                f"{product.price:,.0f} ₸",
                f"{product.rating:.1f} ⭐",
                str(product.review_count)
            ])
        
        products_table = Table(products_data, colWidths=[1.5*cm, 8*cm, 3*cm, 2.5*cm, 2*cm])
        products_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#7c3aed')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), font_bold),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTNAME', (0, 1), (-1, -1), font_name),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
        ]))
        
        elements.append(products_table)
    
    # Footer
    elements.append(Spacer(1, 1.5*cm))
    footer_text = Paragraph(
        "Создано системой Bibarys E-Commerce Platform<br/>Все цены указаны в тенге (₸)<br/>Конфиденциальный документ - только для администрации",
        normal_style
    )
    elements.append(footer_text)
    
    # Build PDF
    doc.build(elements)
    
    return pdf_path
