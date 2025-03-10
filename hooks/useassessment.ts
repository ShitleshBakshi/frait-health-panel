"use client"

import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useAssessmentStore } from '@/lib/assessment-store'
import {
    addFamilyAssessment,
    updateFamilyAssessment,
    removeFamilyAssessment
} from '@/lib/slices/familySlice'
import type { RootState } from '@/lib/store'
import type { AssessmentLevel, FamilyAssessment } from '@/type/assessment'

interface AssessmentItem {
    id: number
    level: AssessmentLevel | null
}

interface UseAssessmentResult {
    // Assessment data from Redux
    assessments: FamilyAssessment[]
    currentAssessment: FamilyAssessment | null

    // Loading and error states
    loading: boolean
    error: string | null

    // Actions
    getAssessmentById: (id: string) => FamilyAssessment | null
    getAssessmentsByFamilyId: (familyId: string) => FamilyAssessment[]
    createAssessment: (assessment: FamilyAssessment) => void
    updateAssessment: (assessment: FamilyAssessment) => void
    deleteAssessment: (id: string) => void

    // Zustand store integration
    loadAssessmentToZustand: (assessment: FamilyAssessment) => void
    saveZustandToRedux: (assessmentId: string, familyId: string) => void
}

export function useAssessment(
    assessmentId?: string,
    familyId?: string
): UseAssessmentResult {
    const dispatch = useDispatch()
    const assessmentStore = useAssessmentStore()

    // Get data from Redux
    const assessments = useSelector((state: RootState) => state.family.assessments)
    const loading = useSelector((state: RootState) => state.family.loading)
    const error = useSelector((state: RootState) => state.family.error)

    // Local state
    const [currentAssessment, setCurrentAssessment] = useState<FamilyAssessment | null>(null)

    // Initialize current assessment if assessmentId is provided
    useEffect(() => {
        if (assessmentId) {
            const assessment = assessments.find(a => a.id === assessmentId) || null
            setCurrentAssessment(assessment)

            // Also load it into Zustand store if found
            if (assessment) {
                loadAssessmentToZustand(assessment)
            }
        }
    }, [assessmentId, assessments])

    // Get assessment by ID
    const getAssessmentById = (id: string): FamilyAssessment | null => {
        return assessments.find(a => a.id === id) || null
    }

    // Get assessments by family ID
    const getAssessmentsByFamilyId = (familyId: string): FamilyAssessment[] => {
        return assessments.filter(a => a.familyId === familyId)
    }

    // Create a new assessment
    const createAssessment = (assessment: FamilyAssessment): void => {
        dispatch(addFamilyAssessment(assessment))
    }

    // Update an existing assessment
    const updateAssessment = (assessment: FamilyAssessment): void => {
        dispatch(updateFamilyAssessment(assessment))
    }

    // Delete an assessment
    const deleteAssessment = (id: string): void => {
        dispatch(removeFamilyAssessment(id))
    }

    // Load assessment data from Redux to Zustand store for editing
    const loadAssessmentToZustand = (assessment: FamilyAssessment): void => {
        // Update main parent assessment
        assessmentStore.updateMainParentAssessment({
            items: assessment.mainParentAssessment.map(item => ({
                id: item.id,
                level: item.level as AssessmentLevel
            }))
        })

        // Update external influence assessment
        assessmentStore.updateExternalInfluenceAssessment({
            items: assessment.externalInfluenceAssessment.map(item => ({
                id: item.id,
                level: item.level as AssessmentLevel
            }))
        })
    }

    // Save data from Zustand store to Redux
    const saveZustandToRedux = (assessmentId: string, familyId: string): void => {
        const mainParentAssessmentItems = assessmentStore.mainParentAssessment.items.map(item => ({
            id: item.id,
            level: item.level
        }))

        const externalInfluenceAssessmentItems = assessmentStore.externalInfluenceAssessment.items.map(item => ({
            id: item.id,
            level: item.level
        }))

        const assessment = getAssessmentById(assessmentId)

        if (assessment) {
            // Update existing assessment
            const updatedAssessment: FamilyAssessment = {
                ...assessment,
                mainParentAssessment: mainParentAssessmentItems,
                externalInfluenceAssessment: externalInfluenceAssessmentItems,
                updatedAt: new Date().toISOString()
            }

            updateAssessment(updatedAssessment)
        } else {
            // This should not happen normally as we're updating an existing assessment
            console.error('Assessment not found:', assessmentId)
        }
    }

    return {
        assessments,
        currentAssessment,
        loading,
        error,
        getAssessmentById,
        getAssessmentsByFamilyId,
        createAssessment,
        updateAssessment,
        deleteAssessment,
        loadAssessmentToZustand,
        saveZustandToRedux
    }
}