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
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from datetime import datetime
from typing import List, Dict, Any
import os
import tempfile
import urllib.request
import sys


class PDFService:
    """Service for generating PDF reports"""
    
    _fonts_registered = False
    
    @staticmethod
    def _register_fonts():
        """Register fonts with Cyrillic support"""
        if PDFService._fonts_registered:
            return
        
        try:
            # Get the backend directory path
            backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
            
            # Try local fonts first (in backend directory)
            font_path = os.path.join(backend_dir, 'DejaVuSans.ttf')
            bold_font_path = os.path.join(backend_dir, 'DejaVuSans-Bold.ttf')
            
            # If not found locally, try system paths
            if not os.path.exists(font_path):
                # For Windows
                if sys.platform == 'win32':
                    font_path = 'C:/Windows/Fonts/DejaVuSans.ttf'
                    bold_font_path = 'C:/Windows/Fonts/DejaVuSans-Bold.ttf'
                    
                    # If DejaVu not found, try Arial Unicode
                    if not os.path.exists(font_path):
                        font_path = 'C:/Windows/Fonts/arial.ttf'
                        bold_font_path = 'C:/Windows/Fonts/arialbd.ttf'
                else:
                    # For Linux
                    font_path = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
                    bold_font_path = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
            
            if os.path.exists(font_path):
                pdfmetrics.registerFont(TTFont('CustomFont', font_path))
                print(f"✓ Registered font: {font_path}")
                if os.path.exists(bold_font_path):
                    pdfmetrics.registerFont(TTFont('CustomFont-Bold', bold_font_path))
                    print(f"✓ Registered bold font: {bold_font_path}")
                PDFService._fonts_registered = True
            else:
                print(f"Warning: Font not found at {font_path}, using Helvetica")
                PDFService._fonts_registered = True
        except Exception as e:
            print(f"Warning: Could not register custom fonts: {e}")
            # Fallback to Helvetica
            PDFService._fonts_registered = True
    
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
        # Register fonts
        PDFService._register_fonts()
        
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
        font_name = 'CustomFont' if PDFService._fonts_registered else 'Helvetica'
        font_bold = 'CustomFont-Bold' if PDFService._fonts_registered else 'Helvetica-Bold'
        
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            fontName=font_bold,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=30,
            alignment=TA_CENTER
        )
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=16,
            fontName=font_bold,
            textColor=colors.HexColor('#1e40af'),
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
        title = Paragraph("Bibarys Analytics Report", title_style)
        elements.append(title)
        
        # Date
        date_text = Paragraph(
            f"Дата создания: {datetime.now().strftime('%d.%m.%Y %H:%M')}",
            normal_style
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
            ('FONTNAME', (0, 0), (-1, 0), font_bold),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTNAME', (0, 1), (-1, -1), font_name),
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
                ('FONTNAME', (0, 0), (-1, 0), font_bold),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('FONTNAME', (0, 1), (-1, -1), font_name),
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
                ('FONTNAME', (0, 0), (-1, 0), font_bold),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('FONTNAME', (0, 1), (-1, -1), font_name),
                ('FONTSIZE', (0, 1), (-1, -1), 9),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
            ]))
            
            elements.append(products_table)
        
        # Footer
        elements.append(Spacer(1, 2*cm))
        footer_text = Paragraph(
            "Создано системой Bibarys E-Commerce Platform<br/>Все цены указаны в тенге (₸)",
            normal_style
        )
        elements.append(footer_text)
        
        # Build PDF
        doc.build(elements)
        
        return pdf_path
    
    @staticmethod
    def generate_seller_report(stats: Dict[str, Any], orders: List[Any], products: List[Any]) -> str:
        """
        Generate seller analytics PDF report
        
        Args:
            stats: Seller statistics
            orders: List of recent orders
            products: List of seller's products
            
        Returns:
            Path to generated PDF file
        """
        # Register fonts
        PDFService._register_fonts()
        
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
        font_name = 'CustomFont' if PDFService._fonts_registered else 'Helvetica'
        font_bold = 'CustomFont-Bold' if PDFService._fonts_registered else 'Helvetica-Bold'
        
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            fontName=font_bold,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=30,
            alignment=TA_CENTER
        )
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=16,
            fontName=font_bold,
            textColor=colors.HexColor('#1e40af'),
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
        title = Paragraph(f"Отчёт продавца - {stats.get('seller_name', 'N/A')}", title_style)
        elements.append(title)
        
        # Date
        date_text = Paragraph(
            f"Дата создания: {datetime.now().strftime('%d.%m.%Y %H:%M')}",
            normal_style
        )
        elements.append(date_text)
        elements.append(Spacer(1, 1*cm))
        
        # Statistics Section
        elements.append(Paragraph("Статистика продавца", heading_style))
        
        stats_data = [
            ['Показатель', 'Значение'],
            ['Всего товаров', f"{stats.get('total_products', 0):,}"],
            ['Активных товаров', f"{stats.get('active_products', 0):,}"],
            ['Баланс кошелька', f"{stats.get('total_balance', 0):,.0f} ₸"],
        ]
        
        stats_table = Table(stats_data, colWidths=[10*cm, 7*cm])
        stats_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3b82f6')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), font_bold),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTNAME', (0, 1), (-1, -1), font_name),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
        ]))
        
        elements.append(stats_table)
        elements.append(Spacer(1, 1*cm))
        
        # Recent Orders Section
        if orders:
            elements.append(Paragraph("Последние заказы", heading_style))
            
            orders_data = [['№', 'Email покупателя', 'Сумма', 'Статус']]
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
                ('FONTNAME', (0, 0), (-1, 0), font_bold),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('FONTNAME', (0, 1), (-1, -1), font_name),
                ('FONTSIZE', (0, 1), (-1, -1), 9),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
            ]))
            
            elements.append(orders_table)
            elements.append(Spacer(1, 1*cm))
        
        # Products Section
        if products:
            elements.append(Paragraph("Мои товары", heading_style))
            
            products_data = [['ID', 'Название', 'Цена', 'Остаток', 'Рейтинг']]
            for product in products[:15]:
                products_data.append([
                    str(product.id),
                    product.name[:45] + ('...' if len(product.name) > 45 else ''),
                    f"{product.price:,.0f} ₸",
                    str(product.quantity),
                    f"{product.rating:.1f} ⭐"
                ])
            
            products_table = Table(products_data, colWidths=[1.5*cm, 8*cm, 3*cm, 2*cm, 2.5*cm])
            products_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3b82f6')),
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
        elements.append(Spacer(1, 2*cm))
        footer_text = Paragraph(
            "Создано системой Bibarys E-Commerce Platform<br/>Все цены указаны в тенге (₸)",
            normal_style
        )
        elements.append(footer_text)
        
        # Build PDF
        doc.build(elements)
        
        return pdf_path
    
    @staticmethod
    def generate_admin_report(stats: Dict[str, Any], orders: List[Any], products: List[Any]) -> str:
        """
        Generate comprehensive admin analytics PDF report
        
        Args:
            stats: Comprehensive platform statistics
            orders: List of recent orders
            products: List of top products
            
        Returns:
            Path to generated PDF file
        """
        # Register fonts
        PDFService._register_fonts()
        
        # Determine font names
        font_name = 'CustomFont' if PDFService._fonts_registered else 'Helvetica'
        font_bold = 'CustomFont-Bold' if PDFService._fonts_registered else 'Helvetica-Bold'
        
        # Call extension module for comprehensive report
        from app.services.pdf_admin_extension import generate_admin_report_extended
        return generate_admin_report_extended(stats, orders, products, font_name, font_bold)
