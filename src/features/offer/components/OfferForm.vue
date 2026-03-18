<!-- src/features/offer/components/OfferForm.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import { CreateOfferSchema, type CreateOfferDTO } from '../types/offer.schema';
import { z } from 'zod';
import { Save, XCircle } from 'lucide-vue-next';

const emit = defineEmits<{
  (e: 'submit', data: CreateOfferDTO): void;
  (e: 'cancel'): void;
}>();

const formData = ref<CreateOfferDTO>({
  baseSalary: 0,
  currency: 'VND',
  startDate: '',
  offerLetterUrl: '',
  note: ''
});

const errors = ref<Record<string, string>>({});

const validate = () => {
  try {
    CreateOfferSchema.parse(formData.value);
    errors.value = {};
    return true;
  } catch (err) {
    if (err instanceof z.ZodError) {
      const formattedErrors: Record<string, string> = {};
      err.issues.forEach((e: z.ZodIssue) => {
        if (e.path[0]) formattedErrors[e.path[0].toString()] = e.message;
      });
      errors.value = formattedErrors;
    }
    return false;
  }
};

const handleSubmit = () => {
  if (validate()) {
    // Clone data to avoid mutations and emit
    emit('submit', { ...formData.value });
  }
};
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-6 max-w-2xl bg-white p-8 rounded-xl shadow-sm border border-slate-200">
    <div class="space-y-5">

      <!-- Base Salary & Currency -->
      <div class="flex gap-4">
        <div class="flex-1">
          <label class="block text-sm font-medium text-slate-700 mb-1">Base Salary</label>
          <input 
            v-model.number="formData.baseSalary" 
            type="number" 
            min="0"
            step="0.01"
            placeholder="e.g. 15000000"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            :class="errors.baseSalary ? 'border-red-500 bg-red-50' : 'border-slate-300'"
          />
          <p v-if="errors.baseSalary" class="text-sm text-red-500 mt-1.5 flex items-center gap-1.5">
            <XCircle :size="14" /> {{ errors.baseSalary }}
          </p>
        </div>
        <div class="w-1/3">
          <label class="block text-sm font-medium text-slate-700 mb-1">Currency</label>
          <select 
            v-model="formData.currency"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
            :class="errors.currency ? 'border-red-500 bg-red-50' : 'border-slate-300'"
          >
            <option value="VND">VND</option>
            <option value="USD">USD</option>
          </select>
          <p v-if="errors.currency" class="text-sm text-red-500 mt-1.5 flex items-center gap-1.5">
            <XCircle :size="14" /> {{ errors.currency }}
          </p>
        </div>
      </div>

      <!-- Start Date -->
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Proposed Start Date</label>
        <input 
          v-model="formData.startDate" 
          type="date" 
          class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          :class="errors.startDate ? 'border-red-500 bg-red-50' : 'border-slate-300'"
        />
        <p v-if="errors.startDate" class="text-sm text-red-500 mt-1.5 flex items-center gap-1.5">
          <XCircle :size="14" /> {{ errors.startDate }}
        </p>
      </div>

      <!-- Offer Letter Link -->
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Offer Document Link <span class="text-slate-400 font-normal">(Optional)</span></label>
        <input 
          v-model="formData.offerLetterUrl" 
          type="url" 
          placeholder="https://docs.google.com/..."
          class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          :class="errors.offerLetterUrl ? 'border-red-500 bg-red-50' : 'border-slate-300'"
        />
        <p v-if="errors.offerLetterUrl" class="text-sm text-red-500 mt-1.5 flex items-center gap-1.5">
          <XCircle :size="14" /> {{ errors.offerLetterUrl }}
        </p>
        <p v-else class="text-xs text-slate-400 mt-1.5">Provide a secure URL where the candidate can view the full offer.</p>
      </div>
      
      <!-- Note -->
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Note <span class="text-slate-400 font-normal">(Optional)</span></label>
        <textarea 
          v-model="formData.note" 
          rows="2"
          placeholder="Any additional notes..."
          class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          :class="errors.note ? 'border-red-500 bg-red-50' : 'border-slate-300'"
        ></textarea>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
      <button 
        type="button" 
        @click="$emit('cancel')"
        class="px-5 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
      >
        Cancel
      </button>
      <button 
        type="submit" 
        class="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
      >
        <Save :size="16" />
        Save as Draft
      </button>
    </div>
  </form>
</template>
