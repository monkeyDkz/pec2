<template>
  <div class="overflow-x-auto">
    <table class="min-w-full bg-white border border-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th v-for="header in headers" :key="header.key" 
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            {{ header.label }}
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-for="(item, index) in data" :key="index" class="hover:bg-gray-50">
          <td v-for="header in headers" :key="header.key" class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            <slot :name="header.key" :item="item">
              {{ item[header.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'BaseTable',
  props: {
    headers: { type: Array, required: true },
    data: { type: Array, required: true }
  }
}
</script>