"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AdminProtection } from "@/components/custom/RoleProtection"
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconCategory,
  IconAlertTriangle,
  IconX,
  IconCheck,
  IconChevronRight
} from "@tabler/icons-react"
import { toast } from "sonner"

function CategoriesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-6 w-12" />
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}

interface Category {
  _id: string
  name: string
  description?: string
  parentId?: string
  sortOrder: number
  isActive: boolean
}

interface CategoryFormProps {
  category?: Category
  parentCategories: Category[]
  onClose: () => void
  onSave: (data: {
    name: string
    description?: string
    parentId?: string
    sortOrder: number
  }) => void
}

function CategoryForm({ category, parentCategories, onClose, onSave }: CategoryFormProps) {
  const [name, setName] = useState(category?.name || "")
  const [description, setDescription] = useState(category?.description || "")
  const [parentId, setParentId] = useState(category?.parentId || "")
  const [sortOrder, setSortOrder] = useState(category?.sortOrder?.toString() || "0")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)
    try {
      await onSave({
        name: name.trim(),
        description: description.trim() || undefined,
        parentId: parentId || undefined,
        sortOrder: parseInt(sortOrder) || 0,
      })
      onClose()
    } catch (error) {
      console.error("Save failed:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{category ? "Edit Category" : "Create Category"}</CardTitle>
              <CardDescription>
                {category ? "Update category details" : "Add a new business category"}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <IconX className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Restaurants"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this category"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parent">Parent Category</Label>
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select parent (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None (Root Category)</SelectItem>
                  {parentCategories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input
                id="sortOrder"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting || !name.trim()} className="flex-1">
                <IconCheck className="h-4 w-4 mr-2" />
                {category ? "Update" : "Create"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function CategoriesPage() {
  return (
    <AdminProtection>
      <CategoriesContent />
    </AdminProtection>
  )
}

function CategoriesContent() {
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const user = useQuery(api.users.current)
  const categories = useQuery(api.categories.getCategories, { includeInactive: true })
  const createCategory = useMutation(api.categories.createCategory)
  const updateCategory = useMutation(api.categories.updateCategory)
  const deleteCategory = useMutation(api.categories.deleteCategory)

  if (user === undefined || categories === undefined) {
    return <CategoriesSkeleton />
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <IconAlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-4">
          You don&apos;t have permission to manage categories.
        </p>
      </div>
    )
  }

  // Organize categories by parent
  const rootCategories = categories.filter(cat => !cat.parentId)
  const subcategoriesMap = categories.reduce((acc, cat) => {
    if (cat.parentId) {
      if (!acc[cat.parentId]) acc[cat.parentId] = []
      acc[cat.parentId].push(cat)
    }
    return acc
  }, {} as Record<string, Category[]>)

  const handleSave = async (data: any) => {
    try {
      if (editingCategory) {
        await updateCategory({
          categoryId: editingCategory._id,
          ...data
        })
        toast.success("Category updated successfully")
      } else {
        await createCategory(data)
        toast.success("Category created successfully")
      }
    } catch (error) {
      toast.error(editingCategory ? "Failed to update category" : "Failed to create category")
      throw error
    }
  }

  const handleDelete = async (categoryId: Id<"categories">) => {
    if (!confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      return
    }

    try {
      await deleteCategory({ categoryId })
      toast.success("Category deleted successfully")
    } catch {
      toast.error("Failed to delete category")
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingCategory(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Category Management</h1>
          <p className="text-muted-foreground">
            Organize business listings into categories
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <IconPlus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Categories</CardDescription>
            <CardTitle className="text-2xl">{categories.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Root Categories</CardDescription>
            <CardTitle className="text-2xl">{rootCategories.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Categories</CardDescription>
            <CardTitle className="text-2xl">{categories.filter(c => c.isActive).length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Categories List */}
      <div className="space-y-4">
        {rootCategories.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <IconCategory className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No categories yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first category to organize business listings
              </p>
              <Button onClick={() => setShowForm(true)}>
                <IconPlus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </CardContent>
          </Card>
        ) : (
          rootCategories.map((category) => (
            <Card key={category._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <IconCategory className="h-5 w-5" />
                      {category.name}
                      {!category.isActive && (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </CardTitle>
                    {category.description && (
                      <CardDescription className="mt-1">
                        {category.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(category)}
                    >
                      <IconEdit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(category._id)}
                    >
                      <IconTrash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {/* Subcategories */}
              {subcategoriesMap[category._id] && (
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Subcategories:</h4>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {subcategoriesMap[category._id].map((subcat) => (
                        <div key={subcat._id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-2">
                            <IconChevronRight className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{subcat.name}</span>
                            {!subcat.isActive && (
                              <Badge variant="outline" className="text-xs">Inactive</Badge>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(subcat)}
                            >
                              <IconEdit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(subcat._id)}
                            >
                              <IconTrash className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Category Form Modal */}
      {showForm && (
        <CategoryForm
          category={editingCategory}
          parentCategories={rootCategories}
          onClose={handleCloseForm}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
