-- Add UPDATE policy for sales_items
CREATE POLICY "Users can update sales items through sales"
ON public.sales_items
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM sales
  WHERE sales.id = sales_items.sales_id
  AND sales.user_id = auth.uid()
));

-- Add UPDATE policy for purchase_items
CREATE POLICY "Users can update purchase items through purchases"
ON public.purchase_items
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM purchases
  WHERE purchases.id = purchase_items.purchase_id
  AND purchases.user_id = auth.uid()
));

-- Add DELETE policy for reminder_settings
CREATE POLICY "Users can delete their own reminder settings"
ON public.reminder_settings
FOR DELETE
USING (auth.uid() = user_id);