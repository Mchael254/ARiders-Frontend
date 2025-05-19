import { Component, ViewChild } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.css']
})
export class MembersComponent {
  @ViewChild('dt') dt!: Table;
  constructor(private messageService: MessageService) { }
  filterGlobal(event: Event) {
  const input = event.target as HTMLInputElement;
  this.dt.filterGlobal(input.value, 'contains');
}

  products = [
    { code: 'P001', name: 'Wireless Keyboard', category: 'Electronics', quantity: 45 },
    { code: 'P002', name: 'Bluetooth Headphones', category: 'Electronics', quantity: 32 },
    { code: 'P003', name: 'Desk Lamp', category: 'Home & Office', quantity: 18 },
    { code: 'P004', name: 'Stainless Steel Water Bottle', category: 'Kitchen', quantity: 56 },
    { code: 'P005', name: 'Yoga Mat', category: 'Fitness', quantity: 24 },
    { code: 'P006', name: 'Smart Watch', category: 'Electronics', quantity: 15 },
    { code: 'P007', name: 'Notebook Set', category: 'Stationery', quantity: 87 },
    { code: 'P008', name: 'Coffee Mug', category: 'Kitchen', quantity: 42 },
    { code: 'P006', name: 'Smart Watch', category: 'Electronics', quantity: 15 },
    { code: 'P007', name: 'Notebook Set', category: 'Stationery', quantity: 87 },
    { code: 'P008', name: 'Coffee Mug', category: 'Kitchen', quantity: 42 }
  ];

  categories = [
    { name: 'Electronics' },
    { name: 'Home & Office' },
    { name: 'Kitchen' },
    { name: 'Fitness' },
    { name: 'Stationery' }
  ];

  selectedProducts: any[] = [];
  productDialog: boolean = false;
  product: any = {};
  submitted: boolean = false;
  visible: boolean = false;

  openNew() {
    this.product = {};
    this.submitted = false;
    this.productDialog = true;
  }

  editProduct(product: any) {
    this.product = { ...product };
    this.productDialog = true;
  }

  hideDialog() {
    this.productDialog = false;
    this.submitted = false;
  }

  saveProduct() {
    this.submitted = true;

    if (this.product.name && this.product.code) {
      if (this.product.code) {
        // Update existing product
        const index = this.products.findIndex(p => p.code === this.product.code);
        if (index !== -1) {
          this.products[index] = { ...this.product };
        }
      } else {
        // Add new product
        this.product.code = this.createId();
        this.products.push({ ...this.product });
      }

      this.productDialog = false;
      this.product = {};
    }
  }

  deleteProduct(product: any) {
    this.products = this.products.filter(p => p.code !== product.code);
    this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Product Deleted', life: 3000 });
  }

  deleteSelectedProducts() {
    this.products = this.products.filter(p => !this.selectedProducts.includes(p));
    this.selectedProducts = [];
    this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Products Deleted', life: 3000 });
  }

  exportCSV() {
    // Implement CSV export logic
  }

  createId(): string {
    let id = 'P' + Math.floor(Math.random() * 1000);
    while (this.products.some(p => p.code === id)) {
      id = 'P' + Math.floor(Math.random() * 1000);
    }
    return id;
  }




}
