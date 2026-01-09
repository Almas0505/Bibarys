"""
PDF service - Generate PDF reports for analytics
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from datetime import datetime
from typing import List, Dict, Any
import os
import tempfile


class PDFService:
    """Service for generating PDF reports"""
    
    @staticmethod
    def generate_analytics_report(stats: Dict[str, Any], orders: List[Any], products: List[Any]) -> str:
        """
        Generate analytics PDF report
        
        Args:
            stats: Dashboard statistics
            orders: List of recent orders
            products: List of top products
            
        Returns:
            Path to generated PDF file
        """
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
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=30,
            alignment=1  # Center
        )
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=12,
            spaceBefore=12
        )
        
        # Title
        title = Paragraph("Bibarys Analytics Report", title_style)
        elements.append(title)
        
        # Date
        date_text = Paragraph(
            f"Дата создания: {datetime.now().strftime('%d.%m.%Y %H:%M')}",
            styles['Normal']
        )
        elements.append(date_text)
        elements.append(Spacer(1, 1*cm))
        
        # Statistics Section
        elements.append(Paragraph("Общая статистика", heading_style))
        
        stats_data = [
            ['Показатель', 'Значение'],
            ['Всего пользователей', f"{stats.get('total_users', 0):,}"],
            ['Всего товаров', f"{stats.get('total_products', 0):,}"],
            ['Всего заказов', f"{stats.get('total_orders', 0):,}"],
            ['Общая выручка', f"{stats.get('total_revenue', 0):,.0f} ₸"],
            ['Ожидающих заказов', f"{stats.get('pending_orders', 0):,}"],
            ['Активных продавцов', f"{stats.get('active_sellers', 0):,}"],
        ]
        
        stats_table = Table(stats_data, colWidths=[10*cm, 7*cm])
        stats_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3b82f6')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
        ]))
        
        elements.append(stats_table)
        elements.append(Spacer(1, 1*cm))
        
        # Recent Orders Section
        if orders:
            elements.append(Paragraph("Последние заказы", heading_style))
            
            orders_data = [['№', 'Email', 'Сумма', 'Статус']]
            for order in orders[:10]:
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
                    user_email,
                    f"{order.total_price:,.0f} ₸",
                    status
                ])
            
            orders_table = Table(orders_data, colWidths=[2*cm, 7*cm, 4*cm, 4*cm])
            orders_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3b82f6')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 1), (-1, -1), 9),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
            ]))
            
            elements.append(orders_table)
            elements.append(Spacer(1, 1*cm))
        
        # Top Products Section
        if products:
            elements.append(Paragraph("Топ товары", heading_style))
            
            products_data = [['ID', 'Название', 'Категория', 'Цена', 'Рейтинг']]
            for product in products[:10]:
                products_data.append([
                    str(product.id),
                    product.name[:40] + ('...' if len(product.name) > 40 else ''),
                    product.category,
                    f"{product.price:,.0f} ₸",
                    f"{product.rating:.1f}"
                ])
            
            products_table = Table(products_data, colWidths=[1.5*cm, 8*cm, 3*cm, 3*cm, 1.5*cm])
            products_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3b82f6')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 1), (-1, -1), 9),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
            ]))
            
            elements.append(products_table)
        
        # Footer
        elements.append(Spacer(1, 2*cm))
        footer_text = Paragraph(
            "Создано системой Bibarys E-Commerce Platform<br/>Все цены указаны в тенге (₸)",
            styles['Normal']
        )
        elements.append(footer_text)
        
        # Build PDF
        doc.build(elements)
        
        return pdf_path
