import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { handleError } from '@/lib/utils/errorHandler'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const userId = formData.get('userId') as string | null

    if (!file || !userId) {
      return NextResponse.json(
        { error: { message: 'File and userId are required' } },
        { status: 400 }
      )
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: { message: 'Invalid file type' } },
        { status: 400 }
      )
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: { message: 'File too large (max 10MB)' } },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Generate a safe filename
    const ext = file.name.split('.').pop() || 'jpg'
    const fileName = `${userId}/id-${Date.now()}.${ext}`

    // Upload to Supabase storage
    const arrayBuffer = await file.arrayBuffer()
    const { error: uploadError } = await supabase.storage
      .from('id-documents')
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      console.error('ID upload error:', uploadError)
      return NextResponse.json(
        { error: { message: 'Failed to upload file' } },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'ID uploaded successfully' }, { status: 200 })
  } catch (error) {
    return handleError(error)
  }
}
